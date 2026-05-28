from langchain_core.prompts import (
    ChatPromptTemplate
)

from core.llm import (
    get_llm
)


llm = get_llm()


prompt = (
    ChatPromptTemplate
    .from_messages(
        [

            (
                "system",
                """
                You are a job assistant.

                Format job results.

                Return:
                - Title
                - Company
                - Location
                - Why relevant
                """
            ),

            (
                "human",
                """
                User Query:
                {query}

                Jobs:
                {jobs}
                """
            )
        ]
    )
)


job_search_chain = (
    prompt
    |
    llm
)