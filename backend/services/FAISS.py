import os
from langchain_community.vectorstores import FAISS
from utils.RAG_splitter import split_docs
from core.embeddings import get_embeddings

BASE_PATH = "vectorstore/faiss"

def build_faiss_index(resume_id: int, docs: list):
    print(f"\n===== BUILDING FAISS INDEX FOR RESUME ID: {resume_id} =====")
    print("DOCS RECEIVED:", len(docs))
    # STEP 1: chunk documents
    chunks = split_docs(docs)
    print("\n===== CHUNKS GENERATED =====")
    for i, chunk in enumerate(chunks):
        print(f"\n--- CHUNK {i} ---")
        print(chunk.page_content)
        print("METADATA:", chunk.metadata)

    # STEP 2: embeddings
    embeddings = get_embeddings()
     # STEP 3: build FAISS index
    vectorstore = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )
    # STEP 4: save per resume
    path = f"{BASE_PATH}/{resume_id}"
    os.makedirs(path, exist_ok=True)

    vectorstore.save_local(path)
    return len(chunks)

def get_resume_context(resume_id:int, query:str):

    embeddings=get_embeddings()
    path = f"{BASE_PATH}/{resume_id}"
    vectorstore = FAISS.load_local(
        path,
        embeddings,
        allow_dangerous_deserialization=True
    )
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5})

    docs=retriever.invoke(query)
    
    return "\n".join([d.page_content for d in docs])


def get_resume_context_for_queries(
    resume_id: int,
    queries: list[str]
) -> str:
    """Retrieve and deduplicate resume evidence for multiple related queries."""
    embeddings = get_embeddings()
    path = f"{BASE_PATH}/{resume_id}"
    vectorstore = FAISS.load_local(
        path,
        embeddings,
        allow_dangerous_deserialization=True
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    unique_chunks: list[str] = []
    seen_chunks: set[str] = set()

    for query in queries:
        for doc in retriever.invoke(query):
            content = doc.page_content.strip()
            if content and content not in seen_chunks:
                seen_chunks.add(content)
                unique_chunks.append(content)

    return "\n\n".join(unique_chunks)
