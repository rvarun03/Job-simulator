from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.chat import ChatRequest
from services.chat import ask_chat_question


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/ask")
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:
        return await ask_chat_question(
            request.resume_id,
            request.question,
            db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
