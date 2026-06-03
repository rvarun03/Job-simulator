import asyncio
from unittest import result
from services.FAISS import get_resume_context
from chains.cover_letter_chain import cover_letter_chain
from core.ws_manager import manager

async def generate_cover_letter(resume_id: int, job_description: str):

    # Step 1: Get resume context from FAISS

    await manager.send(
        resume_id,
        {
            "step": "retrieving_resume_context"
        }
    )

    resume_context = await asyncio.to_thread(
        get_resume_context,
        resume_id,
        job_description
    )

    # Step 2 LLM Generation

    await manager.send(
        resume_id,
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
        resume_id,
        {
            "step": "completed",
            "result": result
        }
    )

    return str(result)
        

