import json
import asyncio
from sqlalchemy.orm import Session
from chains.job_match_chain import job_match_chain
from repository.resume import get_resume_by_id_or_latest
from services.FAISS import get_resume_context
from core.ws_manager import manager

async def match_resume_to_job(resume_id: int | None, job_description: str, db: Session):
    resume = get_resume_by_id_or_latest(db, resume_id)
    if not resume:
        raise ValueError("Resume not found")

    resolved_resume_id = resume.id

    await manager.send(resolved_resume_id, {
        "step": "validating_resume"
    })

    await manager.send(resolved_resume_id, {
        "step": "retrieving_context"
    })

    
    resume_context = await asyncio.to_thread(
        get_resume_context,
        resolved_resume_id,
        job_description
    )

    await manager.send(resolved_resume_id, {
        "step": "running_llm"
    })

    # 🔥 FIX 2: move LLM to thread (VERY IMPORTANT)
    result = await asyncio.to_thread(
        job_match_chain.invoke,
        {
            "resume_context": resume_context,
            "job_description": job_description
        }
    )

    await manager.send(resolved_resume_id, {
        "step": "completed",
        "result": result
    })

    return result
