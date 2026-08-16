from pydantic import BaseModel

class JobSearchRequest(BaseModel):
    query:str
    location: str = "India"