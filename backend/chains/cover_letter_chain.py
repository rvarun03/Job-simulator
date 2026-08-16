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
                You are an expert ATS-optimized cover letter generator.

                STRICT RULES:
                - Output ONLY valid JSON
                - Do NOT include markdown, backticks, or explanations
                - Do NOT hallucinate skills or experience
                - Only use resume context
            """
        ),
        (
            "human",
            """
                Resume Context:
                {resume_context}

                Job Description:
                {job_description}

                Return ONLY this JSON format:

                {{
                    "subject": "string",
                    "cover_letter": "string",
                    "key_strengths_used": ["string"],
                    "keywords_included": ["string"],
                    "ats_score_alignment_notes": "string"
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