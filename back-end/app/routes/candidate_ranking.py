from typing import Annotated

from fastapi import APIRouter, UploadFile, File, Form, Depends

from schemas.candidate_ranking import CandidateRankResponse
from services.candidate_ranking_service import rank_candidates
from core.security import required_roles
from models.user import UserRole, User

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
    ],
    current_user: User = Depends(required_roles(UserRole.HR))
):
    return await rank_candidates(
        job_description=job_description,
        resumes=resumes
    )
