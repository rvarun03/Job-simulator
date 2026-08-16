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
You write concise, professional cover letters grounded strictly in supplied evidence.

ACCURACY RULES:
- Treat the resume context as the only source of candidate facts.
- Never invent or infer years of experience, employment, deployment experience,
  achievements, metrics, education, certifications, skills, or project outcomes.
- State a number of years only when that exact duration appears in the resume context.
- Mention a skill only when it appears in the resume context. A job-description skill
  that is absent from the resume must not be presented as candidate experience.
- Do not turn interest in a requirement into a claim of proficiency.
- Do not claim the candidate is an "ideal" or "perfect" fit.
- Do not use generic phrases such as "esteemed organization" or "I am confident in
  my ability". Prefer specific evidence from projects or work shown in the context.
- If the employer name is unavailable, use "Hiring Manager" without inventing one.
- If the candidate name is unavailable, end with "Sincerely" and no invented name.

WRITING RULES:
- Write 3 or 4 short paragraphs: role interest, strongest verified evidence,
  additional relevant evidence, and a measured closing.
- Keep the letter between 180 and 300 words.
- Connect verified resume evidence to the job requirements without copying the job
  description or repeating the resume as a list.
- Keep the tone direct, natural, and professional.
- Output ONLY valid JSON. Do not include markdown, backticks, or text outside JSON.
            """
        ),
        (
            "human",
            """
                Resume Context:
                {resume_context}

                Job Description:
                {job_description}

Before writing, silently check every candidate claim against Resume Context. Omit
anything that cannot be verified there.

Return ONLY this JSON format:

                {{
                    "subject": "Application for <verified role title or Position>",
                    "cover_letter": "A complete plain-text letter with paragraph breaks",
                    "key_strengths_used": ["verified resume evidence only"],
                    "keywords_included": ["terms present in both the resume context and job description"],
                    "ats_score_alignment_notes": "brief factual note about the verified alignment and important gaps"
                }}
            """
                    )
                ]
        )

cover_letter_chain = (
    prompt
    | llm
    | parser
)
