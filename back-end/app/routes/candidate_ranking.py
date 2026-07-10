from typing import Annotated

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
    job_description: Annotated[str, Form()],
    resumes: Annotated[
        list[UploadFile],
        File(
            json_schema_extra={
                "items": {
                    "type": "string",
                    "format": "binary"
                }
            }
        )
    ]
):
    return await rank_candidates(
        job_description=job_description,
        resumes=resumes
    )
