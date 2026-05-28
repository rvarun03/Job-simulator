from fastapi import FastAPI
import uvicorn
from db.session import Base, engine
from models.resume import Resume
from models.job_match import JobMatch
from core.middleware import setup_cors
from routes.resume import router as resume_router
from routes.analyse_job import router as analyze_job_router  # Import the analyze-job router
from routes.job_match import router as job_match_router  # Import the job-match router
from routes.ws_manager import router as ws_router  # Import the WebSocket router
from routes.resume_improvement import router as resume_improvement_router  # Import the resume improvement router
from routes.cover_letter import router as cover_letter_router  # Import the cover letter router
from routes.job_search import router as job_search_router  # Import the job search router
from routes.chat import router as chat_router

app = FastAPI()
setup_cors(app)
Base.metadata.create_all(bind=engine)

app.include_router(resume_router)
app.include_router(analyze_job_router)  # Include the analyze-job router
app.include_router(job_match_router)  # Include the job-match router
app.include_router(ws_router)
app.include_router(resume_improvement_router)  # Include the resume improvement router
app.include_router(cover_letter_router)  # Include the cover letter router
app.include_router(job_search_router)  # Include the job search router
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message": "AI Job Automation API is running"}


if __name__ == "__main__":
    
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)