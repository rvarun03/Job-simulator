from pydantic import BaseModel
from typing import List, Optional

class CopilotRequest(BaseModel): 
    prompt: str
    resume_id: Optional[int] = None
    job_description: Optional[str] = None
    location: str = "India"