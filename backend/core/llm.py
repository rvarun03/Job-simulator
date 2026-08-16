from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq

from core.config import LLM_PROVIDER, OLLAMA_MODEL, GROQ_API_KEY, GROQ_MODEL

def get_llm():
    if LLM_PROVIDER == "ollama":
        return ChatOllama(model=OLLAMA_MODEL,temperature=0,streaming=True)
    elif LLM_PROVIDER == "groq":
        return ChatGroq(api_key=GROQ_API_KEY, model=GROQ_MODEL,temperature=0,streaming=True)
    else:
        raise ValueError(f"Unsupported LLM provider: {LLM_PROVIDER}")