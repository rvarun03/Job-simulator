from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.llm import get_llm

llm = get_llm()

prompt = ChatPromptTemplate.from_template("""
You are a strict ATS resume-job matching system.

TASK:
1. Extract technical skills explicitly mentioned in the job description
2. Compare them against the resume context
3. A skill is matched ONLY if it explicitly exists in the resume context
4. Do NOT infer related technologies
5. Do NOT hallucinate skills

SCORING RULES:
- If 100% skills match → score 90-100
- If most skills match → score 60-89
- If few skills match → score 30-59
- If NO skills match → score MUST be 0

IMPORTANT RULES:
- Never include a missing skill in matched_skills
- If a skill is not present in the resume context, it MUST go into missing_skills
- If matched_skills is empty, match_score MUST be 0
- Only use exact skills from the job description
- Return ONLY valid JSON
- No markdown
- No trailing commas

Format:

{{
    "match_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "reasoning": "",
    "recommendations": []
}}

Resume Context:
{resume_context}

Job Description:
{job_description}
""")

parser = JsonOutputParser()

job_match_chain = prompt | llm | parser