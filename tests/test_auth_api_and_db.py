import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.services.db import Base, get_db, User
from app.services.model_service import ModelService
from app.services.movie_service import MovieService

from sqlalchemy.pool import StaticPool

# Use isolated async SQLite in-memory database for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_test_db():
    ModelService.load_artifacts()
    MovieService.initialize()

    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[get_db] = override_get_db

    yield

    app.dependency_overrides.pop(get_db, None)

    # Clean up tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.mark.asyncio
async def test_register_new_user_success(async_client):
    """Verify new user registration creates user with MovieLens ID and returns JWT."""
    payload = {
        "email": "freshuser@example.com",
        "password": "Password123!",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email_fails(async_client):
    """Verify registration with already registered email returns 400 Bad Request."""
    payload = {
        "email": "freshuser@example.com",
        "password": "Password123!",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_invalid_email_format(async_client):
    """Verify invalid email string triggers 422 Unprocessable Entity."""
    payload = {
        "email": "not-a-valid-email",
        "password": "Password123!",
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_password_too_long(async_client):
    """Verify password exceeding 72 bytes triggers 422 Unprocessable Entity."""
    payload = {
        "email": "longpwd@example.com",
        "password": "x" * 73,
    }
    response = await async_client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_successful(async_client):
    """Verify login with correct credentials returns a valid JWT token."""
    payload = {
        "email": "freshuser@example.com",
        "password": "Password123!",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password_fails(async_client):
    """Verify login with wrong password returns 401 Unauthorized."""
    payload = {
        "email": "freshuser@example.com",
        "password": "IncorrectPassword999",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_unregistered_email_fails(async_client):
    """Verify login with non-existent email returns 401 Unauthorized."""
    payload = {
        "email": "nonexistent@example.com",
        "password": "AnyPassword123",
    }
    response = await async_client.post("/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(async_client):
    """Verify /auth/me returns user profile and assigned MovieLens ID."""
    # First login to get token
    login_resp = await async_client.post("/auth/login", json={
        "email": "freshuser@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["email"] == "freshuser@example.com"
    assert "movie_lens_user_id" in profile
    assert profile["movie_lens_user_id"] in ModelService._user2idx


@pytest.mark.asyncio
async def test_authenticated_recommend_flow(async_client):
    """Verify authenticated user can fetch personalized recommendations."""
    login_resp = await async_client.post("/auth/login", json={
        "email": "freshuser@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/api/recommend?top_n=5", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "recommendations" in data
    assert len(data["recommendations"]) == 5
    assert data["recommendations"][0]["rank"] == 1


@pytest.mark.asyncio
async def test_authenticated_predict_flow(async_client):
    """Verify authenticated user can predict preference on a movie."""
    login_resp = await async_client.post("/auth/login", json={
        "email": "freshuser@example.com",
        "password": "Password123!",
    })
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.post("/api/predict", json={"movie_id": 1}, headers=headers)
    assert response.status_code == 200
    pred = response.json()
    assert pred["movie_id"] == 1
    assert 0.0 <= pred["score"] <= 1.0

