import asyncio
from fastapi import UploadFile

from utils.pdf_file_reader import extract_pdf_text
from services.tfidf import calculate_tfidf_cosine_score
from chains.candidate_ranking_chain import candidate_ranking_chain

def calculate_final_score(
    ai_score: int,
    tfidf_score: float
) -> float:
    final_score = (
        ai_score * 0.70
        + tfidf_score * 0.30
    )

    return round(float(final_score), 2)

async def rank_candidates(
    job_description: str,
    resumes: list[UploadFile]
):
    
    results=[]

    for resume in resumes:

        resume_text=extract_pdf_text(resume)

        tfidf_score=await asyncio.to_thread(
            calculate_tfidf_cosine_score,
            job_description,
            resume_text
        )

        ai_result=await asyncio.to_thread(
            candidate_ranking_chain.invoke,
            {
                "job_description": job_description,
                "resume_text": resume_text,
                "tfidf_score": tfidf_score
            }
        )

        ai_score = int(ai_result.get("ai_score", 0))

        final_score = calculate_final_score(
            ai_score=ai_score,
            tfidf_score=tfidf_score
        )

        results.append(
            {
                "candidate_name": ai_result.get(
                    "candidate_name",
                    resume.filename
                ),
                "resume_filename": resume.filename,
                "final_score": final_score,
                "ai_score": ai_score,
                "tfidf_score": tfidf_score,
                "strengths": ai_result.get("strengths", []),
                "concerns": ai_result.get("concerns", []),
                "summary": ai_result.get("summary", "")
            }
        )

    results.sort(
        key=lambda item:item["final_score"],
        reverse=True
    )

    ranked_results=[]

    for rank,candidate in enumerate(results, start=1):
        ranked_results.append(
            {
                "rank": rank,
                **candidate
            }
        )

    return ranked_results    