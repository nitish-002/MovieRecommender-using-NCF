from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import (
    HealthResponse,
    RecommendationResponse,
    RecommendationItem,
    PredictionRequest,
    PredictionResponse,
    MetricsResponse,
    MovieSearchResult,
)
from app.services.model_service import ModelService
from app.services.movie_service import MovieService
from app.services.db import User, UserInteraction, get_db
from app.api.auth_routes import get_current_user

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy" if ModelService.is_model_loaded() else "degraded",
        model_loaded=ModelService.is_model_loaded(),
        model_version=ModelService.get_model_version() if ModelService.is_model_loaded() else None,
    )


@router.get("/recommend", response_model=RecommendationResponse)
async def get_recommendations(
    top_n: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not ModelService.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )

    # 1. Check for dynamic user interactions (liked movies)
    result = await db.execute(
        select(UserInteraction).where(UserInteraction.user_id == current_user.id)
    )
    interactions = result.scalars().all()
    liked_ids = [i.movie_id for i in interactions if i.interaction_type == "liked"]
    excluded_ids = {i.movie_id for i in interactions if i.interaction_type in ("liked", "seen", "disliked")}

    if liked_ids:
        try:
            recommendations = ModelService.recommend_from_liked_movies(
                liked_movie_ids=liked_ids,
                excluded_movie_ids=excluded_ids,
                top_n=top_n,
            )
            return RecommendationResponse(
                user_id=current_user.id,
                model_version=ModelService.get_model_version(),
                recommendations=[
                    RecommendationItem(**rec) for rec in recommendations
                ],
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    # 2. Fallback to pre-mapped MovieLens user ID (benchmark / cold-start mode)
    user_id = current_user.movie_lens_user_id
    if user_id is not None and ModelService.validate_user(user_id):
        try:
            recommendations = ModelService.recommend_top_n(user_id, top_n)
            return RecommendationResponse(
                user_id=user_id,
                model_version=ModelService.get_model_version(),
                recommendations=[
                    RecommendationItem(**rec) for rec in recommendations
                ],
            )
        except KeyError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    raise HTTPException(
        status_code=404,
        detail=f"User {current_user.id} has no liked movies and no valid linked benchmark ID."
    )


@router.get("/movies/search", response_model=List[MovieSearchResult])
async def search_movies(
    query: str = Query(..., min_length=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    movies = MovieService.search_movies(query, limit)
    return [MovieSearchResult(**movie) for movie in movies]


@router.post("/predict", response_model=PredictionResponse)
async def predict_preference(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    movie_id = request.movie_id

    if not ModelService.validate_movie(movie_id):
        raise HTTPException(status_code=404, detail=f"Movie {movie_id} not found")

    if not ModelService.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )

    # 1. Check for dynamic user interactions (liked movies)
    result = await db.execute(
        select(UserInteraction).where(
            UserInteraction.user_id == current_user.id,
            UserInteraction.interaction_type == "liked",
        )
    )
    liked_interactions = result.scalars().all()
    liked_ids = [i.movie_id for i in liked_interactions]

    if liked_ids:
        try:
            pred = ModelService.predict_from_liked_movies(liked_ids, movie_id)
            return PredictionResponse(
                user_id=current_user.id,
                movie_id=movie_id,
                prediction_type="surrogate_preference_score",
                score=pred["score"],
                model_version=ModelService.get_model_version(),
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    # 2. Fallback to pre-mapped MovieLens user ID
    user_id = current_user.movie_lens_user_id
    if user_id is not None and ModelService.validate_user(user_id):
        try:
            prediction = ModelService.predict_preference(user_id, movie_id)
            return PredictionResponse(**prediction)
        except KeyError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    raise HTTPException(
        status_code=404,
        detail=f"User {current_user.id} has no liked movies and no valid linked benchmark ID."
    )


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    metrics = ModelService.get_metrics()
    config = ModelService.get_config()

    dataset_stats = config.get("counts", {})
    evaluation_config = config.get("evaluation", {})

    model_comparison = {}
    if "popularity_baseline" in metrics:
        model_comparison["popularity_baseline"] = metrics["popularity_baseline"]
    if "models" in metrics:
        model_comparison["neumf"] = metrics["models"]

    return MetricsResponse(
        dataset_stats=dataset_stats,
        evaluation_config=evaluation_config,
        model_comparison=model_comparison,
        model_version=ModelService.get_model_version(),
    )


@router.get("/movies/{movie_id}", response_model=MovieSearchResult)
async def get_movie(movie_id: int):
    movie = MovieService.get_movie_by_id(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail=f"Movie {movie_id} not found")
    return MovieSearchResult(**movie)
