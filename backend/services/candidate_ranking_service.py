import asyncio
from fastapi import UploadFile

from utils.pdf_file_reader import extract_pdf_text
from services.tfidf import calculate_tfidf_cosine_score
from chains.candidate_ranking_chain import candidate_ranking_chain


def normalize_string_list(value) -> list[str]:
    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    if isinstance(value, str) and value.strip():
        return [value.strip()]

    return []


def calculate_skill_match_score(
    matching_skills: list[str],
    missing_skills: list[str]
) -> float:
    total_skills = len(matching_skills) + len(missing_skills)

    if total_skills == 0:
        return 0.0

    return round(float(len(matching_skills) / total_skills * 100), 2)


def calculate_final_score(
    ai_score: int,
    tfidf_score: float
) -> float:
    final_score = (
        ai_score * 0.70
        + tfidf_score * 0.30
    )

    return round(float(final_score), 2)

async def rank_candidates(
    job_description: str,
    resumes: list[UploadFile]
):
    
    results=[]

    for resume in resumes:

        resume_text=await extract_pdf_text(resume)

        tfidf_score=await asyncio.to_thread(
            calculate_tfidf_cosine_score,
            job_description,
            resume_text
        )

        ai_result=await asyncio.to_thread(
            candidate_ranking_chain.invoke,
            {
                "job_description": job_description,
                "resume_text": resume_text,
                "tfidf_score": tfidf_score
            }
        )

        ai_score = int(ai_result.get("ai_score", 0))

        matching_skills = normalize_string_list(
            ai_result.get(
                "matching_skills",
                ai_result.get("matched_skills", [])
            )
        )
        missing_skills = normalize_string_list(
            ai_result.get("missing_skills", [])
        )
        skill_match_score = calculate_skill_match_score(
            matching_skills=matching_skills,
            missing_skills=missing_skills
        )

        final_score = calculate_final_score(
            ai_score=ai_score,
            tfidf_score=tfidf_score
        )

        results.append(
            {
                "candidate_name": ai_result.get(
                    "candidate_name",
                    resume.filename
                ),
                "resume_filename": resume.filename,
                "final_score": final_score,
                "ai_score": ai_score,
                "tfidf_score": tfidf_score,
                "skill_match_score": skill_match_score,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "strengths": normalize_string_list(
                    ai_result.get("strengths", [])
                ),
                "concerns": normalize_string_list(
                    ai_result.get("concerns", [])
                ),
                "summary": str(ai_result.get("summary", "") or "")
            }
        )

    results.sort(
        key=lambda item:item["final_score"],
        reverse=True
    )

    ranked_results=[]

    for rank,candidate in enumerate(results, start=1):
        ranked_results.append(
            {
                "rank": rank,
                **candidate
            }
        )

    return ranked_results
