from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

from core.llm import get_llm

llm = get_llm()

prompt = ChatPromptTemplate.from_template("""
You are a precise resume-to-job skill comparison system.

Your job is to extract individual technical requirements from the job description and
verify each one against the supplied resume evidence.

SKILL EXTRACTION RULES:
- Return atomic skill names, not requirement sentences.
- "Strong knowledge of Python" becomes "Python".
- "Hands-on experience with FastAPI and RESTful API development" becomes
  "FastAPI" and "REST APIs".
- "Understanding of asynchronous programming and WebSockets" becomes
  "Asynchronous programming" and "WebSockets".
- Remove wording such as "experience with", "knowledge of", "familiarity with",
  "understanding of", "hands-on", and "experience working with".
- Do not classify years of experience, responsibilities, soft skills, or degree
  requirements as technical skills.
- For an alternative such as "FAISS or ChromaDB", consider the requirement satisfied
  if either technology is explicitly present. Do not penalize the absent alternative.

MATCHING RULES:
- Search all resume evidence, including skills, projects, and work experience.
- Match case-insensitively and accept unambiguous formatting variants:
  Next.js/NextJS, REST API/RESTful API, JWT/JSON Web Token, PostgreSQL/Postgres,
  Hugging Face/HuggingFace, and async/asynchronous programming.
- A technology explicitly present anywhere in the resume is matched. The complete
  job-description sentence does not need to appear in the resume.
- Do not infer unrelated skills: Python does not prove FastAPI, and general cloud
  knowledge does not prove AWS.
- Put every extracted technical requirement in exactly one list.
- Never place the same skill in both lists.
- Recommendations must address genuinely missing skills only.
- Do not estimate the final score; the backend computes it deterministically.

Return ONLY valid JSON with this structure, without markdown or trailing commas:

{{
  "match_score": 0,
  "matched_skills": ["atomic skill name"],
  "missing_skills": ["atomic skill name"],
  "reasoning": "brief evidence-based explanation",
  "recommendations": ["specific recommendation"]
}}

Resume Evidence:
{resume_context}

Job Description:
{job_description}
""")

job_match_chain = prompt | llm | JsonOutputParser()
