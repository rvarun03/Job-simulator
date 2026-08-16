from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.resume_improvement import ResumeImprovementRequest

from services.resume_improvement import generate_resume_improvements

router = APIRouter(
    prefix="/resume-improvement",
    tags=["Resume Improvement"]
)

@router.post("/generate")
async def generate_improvements(
    request: ResumeImprovementRequest,
    db: Session = Depends(get_db)
):
    try:
        return await generate_resume_improvements(
            request.resume_id,
            request.job_description,
            db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
