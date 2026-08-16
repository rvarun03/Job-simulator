import asyncio
from sqlalchemy.orm import Session
from services.FAISS import get_resume_context_for_queries
from repository.resume import get_resume_by_id_or_latest
from chains.cover_letter_chain import cover_letter_chain
from core.ws_manager import manager

async def generate_cover_letter(resume_id: int | None, job_description: str, db: Session):
    resume = get_resume_by_id_or_latest(db, resume_id)
    if not resume:
        raise ValueError("Resume not found")

    resolved_resume_id = resume.id

    # Step 1: Get resume context from FAISS

    await manager.send(
        resolved_resume_id,
        {
            "step": "retrieving_resume_context"
        }
    )

    resume_context = await asyncio.to_thread(
        get_resume_context_for_queries,
        resolved_resume_id,
        [
            job_description,
            (
                "candidate name professional summary work experience "
                "projects achievements education technical skills"
            )
        ]
    )

    # Step 2 LLM Generation

    await manager.send(
        resolved_resume_id,
        {
            "step": "generating_cover_letter"
        }
    )

    result = await asyncio.to_thread(
        cover_letter_chain.invoke,
        {
            "resume_context": resume_context,
            "job_description": job_description
        }
    )
    print(result)
    # STEP 3
    await manager.send(
        resolved_resume_id,
        {
            "step": "completed",
            "result": result
        }
    )

    return result
        
