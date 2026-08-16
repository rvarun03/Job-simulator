from fileinput import filename
import json
from sqlalchemy.orm import Session
from chains.resume_chain import resume_chain
from repository.resume import createresume
from services.FAISS import build_faiss_index
from utils.file_parser import load_pdf, load_docx

def parse_and_store_resume(resume_text: str, db: Session):

    parsed_data = resume_chain.invoke({
        "resume_text": resume_text
    })

    resume = createresume(
        db=db,
        structured_data=parsed_data,
        raw_text=resume_text
    )

    data = parsed_data
    if isinstance(data, str):
        data = json.loads(data)

    return {
        "id": resume.id,
        "raw_text": resume.raw_text,
        "structured_data": parsed_data
    }

def ingest_resume(file, db):

    try:
        filename = file.filename.lower()

        if filename.endswith(".pdf"):
            docs = load_pdf(file)
        elif filename.endswith(".docx"):
            docs = load_docx(file)
        else:
            raise ValueError("Unsupported file type")

        if not docs or not docs[0].page_content.strip():
            raise ValueError("Empty resume content")

        resume = createresume(
            db=db,
            raw_text=docs[0].page_content,
            structured_data={
                "source": filename
            }
        )

        build_faiss_index(resume.id, docs)

        return resume

    except Exception as e:
        raise Exception(f"Error processing file: {str(e)}")