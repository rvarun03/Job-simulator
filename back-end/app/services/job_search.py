import asyncio
import requests 

from core.config import(
    ADZUNA_APP_ID,
    ADZUNA_APP_KEY
)

from chains.job_search_chain import job_search_chain

async def search_jobs_service(
        query:str,
        location:str= "India"
):
    
    # STEP 1 — Fetch jobs

    def fetch_jobs():

        url = (
            "https://api.adzuna.com/v1/api/jobs/in/search/1"
        )
    
        params = {

            "app_id":
            ADZUNA_APP_ID,

            "app_key":
            ADZUNA_APP_KEY,

            "what":
            query,

            "where":
            location,

            "results_per_page":
            5
        }

        response = requests.get(
            url,
            params=params,
            timeout=20
        )

        response.raise_for_status()

        return (
            response
            .json()
            .get(
                "results",
                []
            )
        )
    jobs = (
        await asyncio.to_thread(
            fetch_jobs
        )
    )

    # STEP 2 — Handle no jobs

    if not jobs:

        return {
            "jobs": [],
            "summary":
            "No jobs found."
        }

    # STEP 3 — Simplify payload

    formatted_jobs = []

    for job in jobs:

        formatted_jobs.append({

            "title":
            job.get(
                "title"
            ),

            "company":
            (
                job
                .get(
                    "company",
                    {}
                )
                .get(
                    "display_name"
                )
            ),

            "location":
            (
                job
                .get(
                    "location",
                    {}
                )
                .get(
                    "display_name"
                )
            ),

            "description":
            (
                job
                .get(
                    "description",
                    ""
                )[:500]
            )
        })
     # STEP 4 — LLM formatting

    result = (
        await job_search_chain.ainvoke(
            {
                "query":
                query,

                "jobs":
                formatted_jobs
            }
        )
    )

    return result