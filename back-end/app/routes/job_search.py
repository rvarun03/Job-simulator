from fastapi import HTTPException, APIRouter, Depends

router=(APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
))

from schemas.job_search import JobSearchRequest
from services.job_search import search_jobs_service

@router.post("/search")
async def search(
    search_request: JobSearchRequest
):
    
    return await search_jobs_service(
        query=search_request.query,
        location=search_request.location
    )

