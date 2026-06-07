from pydantic import BaseModel


class JobMatchRequest(BaseModel):
    resume_id: int | None = None
    job_description: str
