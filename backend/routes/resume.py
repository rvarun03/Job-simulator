from fastapi import HTTPException, APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from db.session import get_db
from services.resume import parse_and_store_resume
from schemas.resume import ResumeResponse, ResumeUploadRequest
from services.resume import ingest_resume

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/parse", response_model=ResumeResponse)
def parse_resume(request: ResumeUploadRequest, db: Session = Depends(get_db)):
    try:
        resume= parse_and_store_resume(request.resume_text, db=db)
        return resume
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
    
@router.post("/upload")
def upload_resume(file:UploadFile=File(...), db: Session = Depends(get_db)):
    try:
        return ingest_resume(file, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error processing file: " + str(e))        
    