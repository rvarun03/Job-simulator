from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust this in production to specific domains
        allow_methods=["*"],
        allow_headers=["*"],
    )