from pydantic import BaseModel

class ResumeImprovementRequest(BaseModel):
    resume_id: int | None = None
    job_description: str
