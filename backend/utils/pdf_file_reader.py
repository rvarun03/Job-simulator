from io import BytesIO
from fastapi import UploadFile
from pypdf import PdfReader


async def extract_pdf_text(file: UploadFile) -> str:
    content = await file.read()

    pdf_reader = PdfReader(BytesIO(content))

    text = ""

    for page in pdf_reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text.strip()