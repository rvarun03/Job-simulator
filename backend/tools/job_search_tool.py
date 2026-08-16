from langchain.tools import tool

from services.job_search import search_jobs_service

@tool
async def job_search_tool(
    query: str,
    location: str = "India"
):
    
    """ 
    Search for jobs based on a role and location.
    """

    results = await search_jobs_service(
        query=query,
        location=location
    )

    return results["summary"]

