from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)

from langchain_core.runnables.history import RunnableWithMessageHistory

from langchain_community.chat_message_histories import (
    ChatMessageHistory
)

from langchain_core.chat_history import (
    BaseChatMessageHistory
)

from core.llm import get_llm

llm=get_llm()

#MEMORY STORE

store={}

def get_session_history(session_id:str)-> BaseChatMessageHistory:

    if not session_id in store:
        store[session_id] = ChatMessageHistory()

    return store[session_id]

## PROMPT

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            You are an AI resume assistant.

            Your responsibilities:
            - Answer questions about the resume
            - Suggest ATS improvements
            - Explain missing skills
            - Help improve projects and summaries
            - Use resume context carefully

            STRICT RULES:
            - Only use resume context
            - Never hallucinate fake experience
            - Be concise and professional
            """
        ),

        MessagesPlaceholder(
            variable_name="history"
        ),

        (
            "human",
            """
            Resume Context:
            {resume_context}

            Question:
            {question}
            """
        )
    ]
)

# BASE CHAIN

chain = (
    prompt
    | llm
)

chat_chain= RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="history"
)




    
