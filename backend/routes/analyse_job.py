from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.analyse_job import AnalyseJobRequest, AnalyseJobResponse
from services.analyse_job import analyse_job

router = APIRouter(
    prefix="/analyze-job",
    tags=["analyze-job"]
)

@router.post("/", response_model=AnalyseJobResponse)
def analyze_job_endpoint(request: AnalyseJobRequest, db: Session = Depends(get_db)):
    
    try:
        return analyse_job(
            resume_text=request.resume_text,
            job_description=request.job_description,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))