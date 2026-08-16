from sqlalchemy import Column, Integer, String, ForeignKey, Text
from db.session import Base

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(
        Integer,
        ForeignKey("resumes.id")
    )
    job_description = Column(Text)
    analysis = Column(Text)