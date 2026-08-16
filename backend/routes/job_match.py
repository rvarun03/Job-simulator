from fastapi import HTTPException, APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from services.job_match import match_resume_to_job
from schemas.job_match import JobMatchRequest

router = APIRouter(prefix="/match", tags=["match"])

@router.post("/")
async def match_job(job_match_request: JobMatchRequest, db: Session = Depends(get_db)):

    try:
        return await match_resume_to_job(
            resume_id=job_match_request.resume_id,
            job_description=job_match_request.job_description,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
