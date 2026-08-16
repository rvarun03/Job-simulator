from pydantic import BaseModel
from typing import Optional, List

class ResumeUploadRequest(BaseModel):
    resumetext: str
    
class ResumeResponse(BaseModel):
    id: int
    name: str
    skills: List[str]
    experience: str

    