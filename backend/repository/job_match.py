import json
from sqlalchemy.orm import Session
from models.job_match import JobMatch

def create_job_match(db: Session, resume_id: int, job_description: str, analysis: dict):
    match=JobMatch(
        resume_id=resume_id,
        job_description=job_description,
        analysis=json.dumps(analysis)
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match