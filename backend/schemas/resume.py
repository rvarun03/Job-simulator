from pydantic import BaseModel
from typing import Any, Dict, List


class ResumeUploadRequest(BaseModel):
    resume_text: str


class ResumeResponse(BaseModel):
    id: int
    raw_text: str
    structured_data: Dict[str, Any]

    class Config:
        from_attributes = True