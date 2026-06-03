from fastapi import APIRouter

from schemas.copilot import CopilotRequest

from services.copilot import copilot_service

router=APIRouter(
    prefix="/copilot",
    tags=["copilot"]

)

@router.post("/")
async def copilot(
    request: CopilotRequest
):
    return await copilot_service(
        prompt=request.prompt,

        resume_id=request.resume_id,

        job_description=request.job_description,

        location=request.location
    )