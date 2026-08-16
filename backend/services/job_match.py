import asyncio
import re

from sqlalchemy.orm import Session

from chains.job_match_chain import job_match_chain
from core.ws_manager import manager
from repository.resume import get_resume_by_id_or_latest
from services.FAISS import get_resume_context
from services.tfidf import calculate_tfidf_cosine_score


REQUIREMENT_PREFIX = re.compile(
    r"^(?:strong|solid|good|basic|working)?\s*"
    r"(?:hands-on\s+)?(?:knowledge|experience|understanding|familiarity)\s+"
    r"(?:of|with|in)\s+",
    flags=re.IGNORECASE,
)


def clean_skill_label(value: object) -> str:
    skill = str(value).strip().strip("-•.,:;")
    skill = REQUIREMENT_PREFIX.sub("", skill)
    return re.sub(r"\s+", " ", skill).strip()


def normalize_string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []

    normalized: list[str] = []
    seen: set[str] = set()

    for item in value:
        text = clean_skill_label(item)
        key = text.casefold()
        if text and key not in seen:
            seen.add(key)
            normalized.append(text)

    return normalized


def build_match_result(result: dict, tfidf_score: float) -> dict:
    matched_skills = normalize_string_list(result.get("matched_skills"))
    matched_keys = {skill.casefold() for skill in matched_skills}
    missing_skills = [
        skill
        for skill in normalize_string_list(result.get("missing_skills"))
        if skill.casefold() not in matched_keys
    ]

    total_skills = len(matched_skills) + len(missing_skills)
    skill_match_score = (
        round(len(matched_skills) / total_skills * 100, 2)
        if total_skills
        else 0.0
    )
    final_score = round(skill_match_score * 0.70 + tfidf_score * 0.30, 2)

    return {
        "match_score": final_score,
        "skill_match_score": skill_match_score,
        "tfidf_score": tfidf_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "reasoning": str(result.get("reasoning", "") or ""),
        "recommendations": normalize_string_list(result.get("recommendations")),
    }


async def match_resume_to_job(
    resume_id: int | None,
    job_description: str,
    db: Session
):
    resume = get_resume_by_id_or_latest(db, resume_id)
    if not resume:
        raise ValueError("Resume not found")

    resolved_resume_id = resume.id

    await manager.send(resolved_resume_id, {"step": "validating_resume"})
    await manager.send(resolved_resume_id, {"step": "retrieving_context"})

    retrieved_context, tfidf_score = await asyncio.gather(
        asyncio.to_thread(
            get_resume_context,
            resolved_resume_id,
            job_description
        ),
        asyncio.to_thread(
            calculate_tfidf_cosine_score,
            job_description,
            resume.raw_text
        )
    )

    resume_context = (
        "SEMANTICALLY RETRIEVED EVIDENCE:\n"
        f"{retrieved_context}\n\n"
    )

    await manager.send(resolved_resume_id, {"step": "running_llm"})

    raw_result = await asyncio.to_thread(
        job_match_chain.invoke,
        {
            "resume_context": resume_context,
            "job_description": job_description
        }
    )
    result = build_match_result(raw_result, tfidf_score)

    await manager.send(
        resolved_resume_id,
        {"step": "completed", "result": result}
    )

    return result
