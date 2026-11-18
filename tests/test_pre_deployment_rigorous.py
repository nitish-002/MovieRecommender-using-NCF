import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.main import app
from app.services.db import Base, get_db, User, UserInteraction
from app.services.model_service import ModelService
from app.services.movie_service import MovieService

from sqlalchemy.pool import StaticPool

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

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[get_db] = override_get_db

    yield

    app.dependency_overrides.pop(get_db, None)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


# =====================================================================
# 1. PUBLIC ENDPOINTS & CATALOG TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_public_health_and_metrics(async_client):
    health_res = await async_client.get("/api/health")
    assert health_res.status_code == 200
    health = health_res.json()
    assert health["model_loaded"] is True
    assert health["status"] == "healthy"

    metrics_res = await async_client.get("/api/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "dataset_stats" in metrics
    assert "model_comparison" in metrics
    assert "neumf" in metrics["model_comparison"]


@pytest.mark.asyncio
async def test_movie_search_functionality(async_client):
    res = await async_client.get("/api/movies/search?query=toy story&limit=5")
    assert res.status_code == 200
    movies = res.json()
    assert len(movies) > 0
    assert any("toy story" in m["title"].lower() for m in movies)

    # Empty / whitespace search query
    empty_res = await async_client.get("/api/movies/search?query=")
    assert empty_res.status_code == 422


# =====================================================================
# 2. AUTHENTICATION & SECURITY RIGOROUS TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_auth_edge_cases(async_client):
    email = "rigorous_user@example.com"
    pwd = "ValidPassword123!"

    # 1. Registration
    reg_res = await async_client.post("/auth/register", json={"email": email, "password": pwd})
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token

    # 2. Duplicate registration rejected
    dup_res = await async_client.post("/auth/register", json={"email": email, "password": pwd})
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()

    # 3. Invalid login credentials
    bad_login = await async_client.post("/auth/login", json={"email": email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401

    # 4. Valid login
    good_login = await async_client.post("/auth/login", json={"email": email, "password": pwd})
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()

    # 5. Profile check
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await async_client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    me = me_res.json()
    assert me["email"] == email
    assert me["role"] == "user"
    assert me["onboarding_completed"] is False

    # 6. Malformed token rejected
    bad_token_res = await async_client.get("/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
    assert bad_token_res.status_code == 401


# =====================================================================
# 3. ONBOARDING & DYNAMIC RECOMMENDATIONS RIGOROUS TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_onboarding_boundaries_and_recommendations(async_client):
    reg = await async_client.post(
        "/auth/register",
        json={"email": "boundary_user@example.com", "password": "Password123!"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Boundary 1: Reject empty list
    empty_res = await async_client.post("/api/user/onboarding", headers=headers, json={"liked_movie_ids": []})
    assert empty_res.status_code == 422

    # Boundary 2: Reject list of only non-existent movies
    fake_res = await async_client.post("/api/user/onboarding", headers=headers, json={"liked_movie_ids": [99999999]})
    assert fake_res.status_code == 400

    # Boundary 3: Valid single movie onboarding (Toy Story = 1)
    single_res = await async_client.post("/api/user/onboarding", headers=headers, json={"liked_movie_ids": [1]})
    assert single_res.status_code == 200
    assert single_res.json()["liked_count"] == 1

    # Recommendations must exclude liked movie #1
    recs_res = await async_client.get("/api/recommend?top_n=10", headers=headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()["recommendations"]
    rec_ids = {r["movie_id"] for r in recs}
    assert 1 not in rec_ids

    # Add a seen movie: The Matrix = 2571
    seen_res = await async_client.post(
        "/api/user/interactions",
        headers=headers,
        json={"movie_id": 2571, "interaction_type": "seen"},
    )
    assert seen_res.status_code == 200

    # Re-query recommendations -> neither 1 nor 2571 can be in recommendations
    recs_res2 = await async_client.get("/api/recommend?top_n=20", headers=headers)
    rec_ids2 = {r["movie_id"] for r in recs_res2.json()["recommendations"]}
    assert 1 not in rec_ids2
    assert 2571 not in rec_ids2

    # Match prediction for Star Wars (260)
    pred_res = await async_client.post("/api/predict", headers=headers, json={"movie_id": 260})
    assert pred_res.status_code == 200
    pred = pred_res.json()
    assert 0.0 <= pred["score"] <= 1.0


# =====================================================================
# 4. ADMIN ROLE, PASSWORD PROTECTION & BENCHMARK TESTING
# =====================================================================

@pytest.mark.asyncio
async def test_admin_password_and_benchmark_lifecycle(async_client):
    reg = await async_client.post(
        "/auth/register",
        json={"email": "admin_lifecycle@example.com", "password": "Password123!"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Unprivileged attempt to set benchmark ID fails
    unauth_set = await async_client.post("/api/admin/set-benchmark-id", headers=headers, json={"movie_lens_user_id": 100})
    assert unauth_set.status_code == 403

    # 2. Attempt to unlock admin with invalid password fails
    wrong_pwd = await async_client.post("/api/admin/verify-password", headers=headers, json={"password": "wrong_password"})
    assert wrong_pwd.status_code == 403

    # 3. Attempt to unlock admin with empty password fails
    empty_pwd = await async_client.post("/api/admin/verify-password", headers=headers, json={"password": ""})
    assert empty_pwd.status_code == 403

    # 4. Unlock admin with valid password (12345qwe) succeeds
    good_pwd = await async_client.post("/api/admin/verify-password", headers=headers, json={"password": "12345qwe"})
    assert good_pwd.status_code == 200
    assert good_pwd.json()["role"] == "admin"

    # Profile now confirms admin role
    me_res = await async_client.get("/auth/me", headers=headers)
    assert me_res.json()["role"] == "admin"

    # 5. Setting valid benchmark user ID #260 succeeds
    set_res = await async_client.post("/api/admin/set-benchmark-id", headers=headers, json={"movie_lens_user_id": 260})
    assert set_res.status_code == 200
    assert set_res.json()["movie_lens_user_id"] == 260

    # 6. Setting out-of-bounds user ID fails with 404
    out_res = await async_client.post("/api/admin/set-benchmark-id", headers=headers, json={"movie_lens_user_id": 99999999})
    assert out_res.status_code == 404

    # 7. Exit admin mode returns user to standard role
    exit_res = await async_client.post("/api/admin/exit-admin-mode", headers=headers)
    assert exit_res.status_code == 200
    assert exit_res.json()["role"] == "user"

    # 8. Subsequent attempt to set benchmark ID is now forbidden again
    forbidden_again = await async_client.post("/api/admin/set-benchmark-id", headers=headers, json={"movie_lens_user_id": 100})
    assert forbidden_again.status_code == 403


# =====================================================================
# 5. DATABASE CASCADE INTEGRITY TEST
# =====================================================================

@pytest.mark.asyncio
async def test_database_cascade_on_user_deletion():
    """Verify that deleting a user deletes all their user_interactions cleanly."""
    async with TestSessionLocal() as session:
        # Create user with interactions via relationship
        user = User(email="cascade_tester@example.com", password_hash="hash123", movie_lens_user_id=123)
        inter1 = UserInteraction(movie_id=1, interaction_type="liked")
        inter2 = UserInteraction(movie_id=260, interaction_type="seen")
        user.interactions.extend([inter1, inter2])
        session.add(user)
        await session.commit()
        await session.refresh(user)
        user_id = user.id

        # Verify interactions exist
        res = await session.execute(select(UserInteraction).where(UserInteraction.user_id == user_id))
        assert len(res.scalars().all()) == 2

        # Delete user
        await session.delete(user)
        await session.commit()

        # Verify interactions are automatically deleted via CASCADE
        res_after = await session.execute(select(UserInteraction).where(UserInteraction.user_id == user_id))
        assert len(res_after.scalars().all()) == 0
