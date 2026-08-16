from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.llm import get_llm

llm = get_llm()




prompt = ChatPromptTemplate.from_template("""
You are a strict ATS resume optimization system.

TASK:
1. Analyze the resume against the given job description
2. Improve ATS alignment
3. Suggest stronger resume content
4. Recommend missing keywords
5. Optimize resume wording for ATS systems

IMPORTANT RULES:
- Only use information available in the resume context
- Do NOT hallucinate fake experience
- Do NOT invent projects
- Do NOT invent companies
- Do NOT invent technologies
- Use exact keywords from the job description where relevant
- Keep suggestions realistic
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- No trailing commas

Return JSON format:

{{
    "summary_improvements": [],
    "missing_keywords_to_add": [],
    "project_improvements": [],
    "skill_recommendations": [],
    "ats_optimization_tips": []
}}

Resume Context:
{resume_context}

Job Description:
{job_description}
""")



resume_improvement_chain = (
    prompt
    | llm
    | JsonOutputParser()
)   