from chains.resume_chain import resume_chain

result = resume_chain.invoke({
    "resume_text": """
    John Doe is a backend developer with
    3 years of experience in Python,
    FastAPI, SQL, and Redis.
    """
})
print(result)