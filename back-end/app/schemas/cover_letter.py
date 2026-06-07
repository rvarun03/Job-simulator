from pydantic import BaseModel

class CoverLetterRequest(BaseModel):

    resume_id: int | None = None

    job_description: str
