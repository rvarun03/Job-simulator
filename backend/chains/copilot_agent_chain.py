from langchain.agents import create_agent

from core.llm import get_llm

from tools.cover_letter_tool import cover_letter_tool

from tools.job_search_tool import job_search_tool

from tools.resume_improvement_tool import resume_improvement_tool

llm = get_llm()

tools=[
    cover_letter_tool,
    job_search_tool,
    resume_improvement_tool
]



copilot_agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="""
    You are a career copilot.

    Available tools:

    1. resume_improvement_tool
    Use ONLY when the user asks for:
    - resume improvements
    - ATS suggestions
    - resume review

    2. cover_letter_tool
    Use ONLY when the user asks for:
    - cover letter
    - application letter

    3. job_search_tool
    Use ONLY when the user asks for:
    - find jobs
    - search jobs
    - job openings

    IMPORTANT:

    - Call ONLY the tool required.
    - Do NOT call multiple tools.
    - Do NOT search jobs unless user explicitly asks.
    - Do NOT generate a cover letter unless user explicitly asks.
    - Do NOT improve resume unless user explicitly asks.

    If user asks for multiple tasks,
    then call all required tools.
    """
)
