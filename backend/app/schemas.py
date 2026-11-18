from typing import List, Optional
from pydantic import BaseModel, Field


class MovieBase(BaseModel):
    movie_id: int
    title: str
    genres: List[str] = []


class MovieSearchResult(MovieBase):
    pass


class RecommendationItem(BaseModel):
    rank: int
    movie_id: int
    title: str
    genres: List[str]
    score: float


class RecommendationResponse(BaseModel):
    user_id: int
    model_version: str
    recommendations: List[RecommendationItem]


class PredictionRequest(BaseModel):
    movie_id: int


class PredictionResponse(BaseModel):
    user_id: int
    movie_id: int
    prediction_type: str
    score: float
    model_version: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: Optional[str] = None


class MetricsResponse(BaseModel):
    dataset_stats: dict
    evaluation_config: dict
    model_comparison: dict
    model_version: str


class MovieSearchQuery(BaseModel):
    query: str = Field(..., min_length=1)
    limit: int = Field(default=20, ge=1, le=100)


class OnboardingRequest(BaseModel):
    liked_movie_ids: List[int] = Field(..., min_length=1, max_length=50)


class InteractionCreateRequest(BaseModel):
    movie_id: int
    interaction_type: str = Field(default="liked", pattern="^(liked|seen|disliked)$")


class InteractionItem(BaseModel):
    id: int
    movie_id: int
    interaction_type: str
    title: Optional[str] = None
    genres: Optional[List[str]] = None


class UserInteractionsResponse(BaseModel):
    interactions: List[InteractionItem]
    liked_movie_ids: List[int]
    seen_movie_ids: List[int]


class SurrogateRecommendRequest(BaseModel):
    liked_movie_ids: List[int] = Field(..., min_length=1, max_length=50)
    excluded_movie_ids: Optional[List[int]] = Field(default=None)
    top_n: int = Field(default=10, ge=1, le=100)


class SurrogatePredictRequest(BaseModel):
    liked_movie_ids: List[int] = Field(..., min_length=1, max_length=50)
    target_movie_id: int


class SurrogatePredictResponse(BaseModel):
    target_movie_id: int
    prediction_type: str
    score: float
    liked_movies_count: int
    model_version: str


class BenchmarkIdRequest(BaseModel):
    movie_lens_user_id: int = Field(..., ge=1)


class AdminRoleRequest(BaseModel):
    password: Optional[str] = None
