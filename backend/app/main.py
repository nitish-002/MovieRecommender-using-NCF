import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import router as api_router
from app.api.auth_routes import router as auth_router
from app.api.interaction_routes import router as interaction_router
from app.services.model_service import ModelService
from app.services.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Asynchronously initialize DB in background so startup is non-blocking
    if not os.environ.get("TESTING") and not os.environ.get("PYTEST_CURRENT_TEST"):
        asyncio.create_task(init_db())
    ModelService.load_artifacts()
    yield


app = FastAPI(
    title="Movie Recommender API",
    description="Neural Collaborative Filtering Movie Recommendation System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(api_router, prefix="/api")
app.include_router(interaction_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Movie Recommender API", "version": "1.0.0"}