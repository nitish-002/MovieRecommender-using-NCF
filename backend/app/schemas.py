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
