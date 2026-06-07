import json
from sqlalchemy.orm import Session
from models.resume import Resume

def createresume(db:Session, structured_data: dict, raw_text: str):
    resume=Resume(
        raw_text=raw_text,
        structured_data=json.dumps(structured_data)
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume

   
def get_resume_by_id_or_latest(db: Session, resume_id: int | None = None):
    query = db.query(Resume)

    if resume_id is not None:
        return query.filter(Resume.id == resume_id).first()

    return query.order_by(Resume.id.desc()).first()
