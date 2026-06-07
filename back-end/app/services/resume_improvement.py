import asyncio
from services.FAISS import get_resume_context
from sqlalchemy.orm import Session
from chains.resume_improvement_chain import resume_improvement_chain
from repository.resume import get_resume_by_id_or_latest

from core.ws_manager import manager

async def generate_resume_improvements(resume_id: int | None, job_description: str, db: Session):
    resume = get_resume_by_id_or_latest(db, resume_id)
    if not resume:
        raise ValueError("Resume not found")

    resolved_resume_id = resume.id

    # Step 1: Get resume context from FAISS
    # STEP 1

    await manager.send(
        resolved_resume_id,
        {
            "step": "retrieving_resume_context"
        }
    )

    resume_context = await asyncio.to_thread(get_resume_context, resolved_resume_id, job_description)
    print("Resume Context Retrieved:", resume_context)
    # Step 2: LLM Generation
    
    try:
        await manager.send(
            resolved_resume_id,
            {
                "step": "running_llm"
            }
        )
        result = await asyncio.to_thread(
            resume_improvement_chain.invoke,
            {
                "resume_context": resume_context,
                "job_description": job_description
            }
        )
    except Exception as e:
        print("Chain error:", e) 
        raise
    await manager.send(
        resolved_resume_id,
        {
            "step": "completed",
            "result": result
        }
    )
    
    return result
