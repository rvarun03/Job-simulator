from fastapi import APIRouter, UploadFile, File, Form

from schemas.candidate_ranking import CandidateRankResponse
from services.candidate_ranking_service import rank_candidates


router = APIRouter(
    prefix="/hr",
    tags=["Candidate Ranking"]
)


@router.post(
    "/candidates/rank",
    response_model=list[CandidateRankResponse]
)
async def candidate_ranking(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...)
):
    return await rank_candidates(
        job_description=job_description,
        resumes=resumes
    )