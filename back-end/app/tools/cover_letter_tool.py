from langchain.tools import tool

from services.cover_letter import generate_cover_letter

@tool
async def cover_letter_tool(
    resume_id: int,
    job_description: str
):
    
    """
    Generate a cover letter based on resume  and job description.
    """

    result = await generate_cover_letter(
        resume_id,
        job_description
    )
    
    return str(result)