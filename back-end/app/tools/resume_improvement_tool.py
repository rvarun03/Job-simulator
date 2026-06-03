from langchain.tools import tool

from services.resume_improvement import generate_resume_improvements

@tool
async def resume_improvement_tool(
    resume_id: int,
    job_description: str
):
    
    """
    Improve resume and suggest ATS fixes.
    """

    result = await generate_resume_improvements(
        resume_id,
        job_description
    )
    return str(result)