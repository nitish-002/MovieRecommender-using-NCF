from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List

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
from app.services.db import User
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
):
    user_id = current_user.movie_lens_user_id

    if not ModelService.validate_user(user_id):
        raise HTTPException(status_code=404, detail=f"Linked MovieLens user {user_id} not found")

    if not ModelService.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )

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
):
    movie_id = request.movie_id
    user_id = current_user.movie_lens_user_id

    if not ModelService.validate_user(user_id):
        raise HTTPException(status_code=404, detail=f"Linked MovieLens user {user_id} not found")

    if not ModelService.validate_movie(movie_id):
        raise HTTPException(status_code=404, detail=f"Movie {movie_id} not found")

    if not ModelService.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first."
        )

    try:
        prediction = ModelService.predict_preference(user_id, movie_id)
        return PredictionResponse(**prediction)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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
