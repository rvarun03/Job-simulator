from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db

from schemas.cover_letter import CoverLetterRequest

from services.cover_letter import generate_cover_letter

router = APIRouter( 
    prefix="/cover-letter",
    tags=["Cover Letter"]
    )

@router.post("/generate")
async def generate(
    request: CoverLetterRequest,
    db: Session = Depends(get_db)
):
    try:
        return await generate_cover_letter(
            request.resume_id,
            request.job_description,
            db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
