import asyncio
from services.FAISS import get_resume_context
from chains.chat_chain import chat_chain
from core.ws_manager import manager

active_chat_ids: set[int] = set()


async def ask_chat_question(
        resume_id: int,
        question: str
):
    if resume_id in active_chat_ids:
        await manager.send(
            resume_id,
            {
                "step": "busy"
            }
        )

        return {
            "answer": "",
            "status": "busy"
        }

    active_chat_ids.add(resume_id)

    try:
        return await stream_chat_answer(
            resume_id,
            question
        )
    finally:
        active_chat_ids.discard(resume_id)


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
    
