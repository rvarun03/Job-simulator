from pydantic import BaseModel


class CandidateAIResult(BaseModel):
    candidate_name: str
    ai_score: int
    summary: str
    matching_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    concerns: list[str]


class CandidateRankResponse(BaseModel):
    rank: int
    candidate_name: str
    resume_filename: str

    final_score: float
    ai_score: int
    tfidf_score: float
    skill_match_score: float

    matching_skills: list[str]
    missing_skills: list[str]
    strengths: list[str]
    concerns: list[str]
    summary: str