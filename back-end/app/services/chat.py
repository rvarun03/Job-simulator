import asyncio
from sqlalchemy.orm import Session
from services.FAISS import get_resume_context
from chains.chat_chain import chat_chain
from core.ws_manager import manager
from repository.resume import get_resume_by_id_or_latest

active_chat_ids: set[int] = set()


async def ask_chat_question(
        resume_id: int | None,
        question: str,
        db: Session
):
    resume = get_resume_by_id_or_latest(db, resume_id)
    if not resume:
        raise ValueError("Resume not found")

    resolved_resume_id = resume.id

    if resolved_resume_id in active_chat_ids:
        await manager.send(
            resolved_resume_id,
            {
                "step": "busy"
            }
        )

        return {
            "answer": "",
            "status": "busy"
        }

    active_chat_ids.add(resolved_resume_id)

    try:
        return await stream_chat_answer(
            resolved_resume_id,
            question
        )
    finally:
        active_chat_ids.discard(resolved_resume_id)


async def stream_chat_answer(
        resume_id: int,
        question: str
):
    # Step 1: get resume content

    await manager.send(
        resume_id,
        {
            "step": "retrieving_context"
        }
    )

    resume_context= await asyncio.to_thread(
        get_resume_context, 
        resume_id, 
        question
    )    

    # Step 2: LLM invocation

    await manager.send(
        resume_id,
        {
            "step": "thinking"
        }
    )

    final_answer = ""

    async for chunk in chat_chain.astream(
        {
            "resume_context": resume_context,
            "question": question
        },
        config={
            "configurable": {
                "session_id": str(resume_id)
            }
        }
    ):
        
        
        token = chunk.content

        final_answer += token

        await manager.send(
            resume_id,
            {
                "step":"stream",
                "token": token
            }
        )

    await manager.send(
        resume_id,
        {
            "step": "completed"
        }
    )

    return {
        "answer": final_answer
    }
    
