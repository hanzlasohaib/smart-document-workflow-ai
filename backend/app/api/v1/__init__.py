from fastapi import APIRouter

from app.routes import auth, documents, review

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(documents.router)
api_router.include_router(review.router)
