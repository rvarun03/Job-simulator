from pydantic import BaseModel
from typing import Dict, Any

class AnalyseJobRequest(BaseModel):
    resume_text: str
    job_description: str

class AnalyseJobResponse(BaseModel):
    resume_id: int
    analysis: Dict[str, Any]    