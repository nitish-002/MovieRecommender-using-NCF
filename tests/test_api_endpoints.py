import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.model_service import ModelService
from app.services.movie_service import MovieService


@pytest.fixture(scope="module")
def client():
    """Create test client with loaded model artifacts."""
    ModelService.load_artifacts()
    MovieService.initialize()
    with TestClient(app) as test_client:
        yield test_client


def test_api_root(client):
    """Verify root endpoint returns 200 OK and version."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["message"] == "Movie Recommender API"


def test_api_health(client):
    """Verify health endpoint reports model status and version."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["model_version"] is not None


def test_api_metrics(client):
    """Verify metrics endpoint returns dataset statistics and model comparisons."""
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "dataset_stats" in data
    assert "evaluation_config" in data
    assert "model_comparison" in data


def test_api_search_movies_success(client):
    """Verify catalog search returns matching movies."""
    response = client.get("/api/movies/search?query=matrix&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any("matrix" in m["title"].lower() for m in data)


def test_api_search_movies_validation_missing_query(client):
    """Verify search returns 422 Unprocessable Entity when query param is missing."""
    response = client.get("/api/movies/search")
    assert response.status_code == 422


def test_api_get_movie_by_id_success(client):
    """Verify movie lookup by ID returns correct movie metadata."""
    response = client.get("/api/movies/1")
    assert response.status_code == 200
    data = response.json()
    assert data["movie_id"] == 1
    assert "Toy Story" in data["title"]
    assert isinstance(data["genres"], list)


def test_api_get_movie_by_id_not_found(client):
    """Verify movie lookup with non-existent ID returns 404."""
    response = client.get("/api/movies/999999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_api_recommend_unauthenticated_rejected(client):
    """Verify /api/recommend rejects requests missing an Authorization header."""
    response = client.get("/api/recommend?top_n=10")
    assert response.status_code in (401, 403)


def test_api_predict_unauthenticated_rejected(client):
    """Verify /api/predict rejects requests missing an Authorization header."""
    response = client.post("/api/predict", json={"movie_id": 1})
    assert response.status_code in (401, 403)
