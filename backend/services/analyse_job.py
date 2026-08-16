from sqlalchemy.orm import Session
from chains.resume_chain import resume_chain
from chains.job_match_chain import job_match_chain
from repository.resume import createresume
from repository.job_match import create_job_match

def analyse_job(db: Session, resume_text: str, job_description: str):

   # STEP 1 — PARSE RESUME

    parsed_resume = resume_chain.invoke({
        "resume_text": resume_text
    })

    # STEP 2 — STORE THE RESUME

    resume=createresume(db=db, structured_data=parsed_resume, raw_text=resume_text)

    # STEP 3 — PARSE JOB DESCRIPTION AND MATCH WITH RESUME

    analysis = job_match_chain.invoke({
        "resume_data": resume_text,
        "job_description": job_description
    })

    # STEP 4 — STORE THE JOB MATCH RESULT

    create_job_match(db=db, resume_id=resume.id, job_description=job_description, analysis=analysis)

    return {
        "resume_id": resume.id,
        "analysis": analysis    
    }