from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.llm import get_llm

llm = get_llm()
parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are an expert technical recruiter and resume evaluator.

STRICT RULES:
- Output ONLY valid JSON
- Do NOT include markdown, backticks, or explanations
- Do NOT hallucinate skills or experience
- Use only the given resume text and job description
- Give a realistic AI score from 0 to 100
- Do not give high score just because keywords match
- Penalize missing must-have skills
- Reward relevant project/work experience
- Extract technical skills from the job description
- Put skills explicitly found in the resume in matching_skills
- Put job-description skills not found in the resume in missing_skills
"""
        ),
        (
            "human",
            """
Job Description:
{job_description}

Resume Text:
{resume_text}

TF-IDF Similarity Score:
{tfidf_score}

Return ONLY this JSON format:

{{
    "candidate_name": "string",
    "ai_score": 0,
    "summary": "string",
    "matching_skills": ["string"],
    "missing_skills": ["string"],
    "strengths": ["string"],
    "concerns": ["string"]
}}
"""
        )
    ]
)

candidate_ranking_chain = (
    prompt
    | llm
    | parser
)
