from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from core.llm import get_llm

llm=get_llm()

prompt=ChatPromptTemplate.from_messages(
    [
        ("system", 
        """
            You are an expert resume parser.

            Extract structured information from resumes.

            Return ONLY valid JSON in this format:

            {{
              "name": "",
              "skills": [],
              "experience": [],
              "education": []
            }}
        """),
        ("human", 
        """
            Resume:

            {resume_text}
        """
        )
    ]
)

parser=JsonOutputParser()

resume_chain= prompt | llm | parser