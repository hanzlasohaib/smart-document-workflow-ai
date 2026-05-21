from fastapi import FastAPI
from app.routes import documents, auth

import logging

# ✅ Proper logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Document Workflow AI")

# Routers
app.include_router(auth.router)
app.include_router(documents.router)

# Root route
@app.get("/")
def read_root():
    logger.info("Root endpoint called")
    return {"message": "API is running"}