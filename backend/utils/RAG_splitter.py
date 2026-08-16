from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


def split_docs(docs: list[Document]) -> list[Document]:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(docs)

    # optional metadata enrichment
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = i

    return chunks