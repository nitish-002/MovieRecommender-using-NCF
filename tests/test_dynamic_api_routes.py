import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.services.db import Base, get_db
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


@pytest.mark.asyncio
async def test_surrogate_recommend_endpoint_public(async_client):
    """Verify public ad-hoc surrogate recommendation endpoint."""
    payload = {
        "liked_movie_ids": [1, 260],
        "top_n": 5,
    }
    response = await async_client.post("/api/surrogate/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 5
    for rec in data["recommendations"]:
        assert rec["movie_id"] not in [1, 260]


@pytest.mark.asyncio
async def test_surrogate_recommend_endpoint_invalid_movies(async_client):
    """Verify surrogate recommendation with unknown movie IDs returns 400."""
    payload = {
        "liked_movie_ids": [99999999],
        "top_n": 5,
    }
    response = await async_client.post("/api/surrogate/recommend", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_surrogate_predict_endpoint_public(async_client):
    """Verify public ad-hoc surrogate prediction endpoint."""
    payload = {
        "liked_movie_ids": [1, 260],
        "target_movie_id": 1196,
    }
    response = await async_client.post("/api/surrogate/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_movie_id"] == 1196
    assert 0.0 <= data["score"] <= 1.0


@pytest.mark.asyncio
async def test_surrogate_predict_endpoint_unknown_target(async_client):
    """Verify surrogate prediction with unknown target movie returns 404."""
    payload = {
        "liked_movie_ids": [1, 260],
        "target_movie_id": 99999999,
    }
    response = await async_client.post("/api/surrogate/predict", json=payload)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_dynamic_user_onboarding_and_recommendations_flow(async_client):
    """Complete dynamic lifecycle: Register -> Onboard -> Recs exclude liked -> Add Seen -> Exclude Seen."""
    # 1. Register a new user
    reg_res = await async_client.post(
        "/auth/register",
        json={"email": "dynamic_tester@example.com", "password": "Password123!"},
    )
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check initial profile shows onboarding_completed == False
    me_res = await async_client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["onboarding_completed"] is False

    # 3. Complete onboarding with 3 movies: Toy Story (1), Star Wars (260), Matrix (2571)
    onboard_res = await async_client.post(
        "/api/user/onboarding",
        headers=headers,
        json={"liked_movie_ids": [1, 260, 2571]},
    )
    assert onboard_res.status_code == 200
    assert onboard_res.json()["onboarding_completed"] is True
    assert onboard_res.json()["liked_count"] == 3

    # 4. Profile now shows onboarding_completed == True
    me_after = await async_client.get("/auth/me", headers=headers)
    assert me_after.json()["onboarding_completed"] is True

    # 5. Fetch dynamic recommendations
    recs_res = await async_client.get("/api/recommend?top_n=10", headers=headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()["recommendations"]
    assert len(recs) == 10
    rec_movie_ids = {r["movie_id"] for r in recs}
    for m in [1, 260, 2571]:
        assert m not in rec_movie_ids, f"Liked movie {m} must be excluded from recommendations"

    # 6. Record an 'already seen' movie interaction for Empire Strikes Back (1196)
    interact_res = await async_client.post(
        "/api/user/interactions",
        headers=headers,
        json={"movie_id": 1196, "interaction_type": "seen"},
    )
    assert interact_res.status_code == 200
    assert interact_res.json()["interaction_type"] == "seen"

    # 7. Query all interactions
    list_res = await async_client.get("/api/user/interactions", headers=headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert 1196 in list_data["seen_movie_ids"]
    assert set(list_data["liked_movie_ids"]) == {1, 260, 2571}

    # 8. Dynamic recommendations now also exclude 1196
    recs_res2 = await async_client.get("/api/recommend?top_n=20", headers=headers)
    recs2 = recs_res2.json()["recommendations"]
    rec_ids2 = {r["movie_id"] for r in recs2}
    assert 1196 not in rec_ids2, "Seen movie 1196 must be excluded from recommendations"

    # 9. Test dynamic prediction endpoint
    pred_res = await async_client.post(
        "/api/predict",
        headers=headers,
        json={"movie_id": 500},
    )
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert pred_data["prediction_type"] == "surrogate_preference_score"
    assert 0.0 <= pred_data["score"] <= 1.0

    # 10. Remove interaction for movie 1196
    del_res = await async_client.delete("/api/user/interactions/1196", headers=headers)
    assert del_res.status_code == 200

    # 11. Deleting again returns 404
    del_res404 = await async_client.delete("/api/user/interactions/1196", headers=headers)
    assert del_res404.status_code == 404


@pytest.mark.asyncio
async def test_user_taste_profile_reset(async_client):
    """Verify resetting interactions clears table and resets onboarding status."""
    reg = await async_client.post(
        "/auth/register",
        json={"email": "reset_tester@example.com", "password": "Password123!"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add interaction
    await async_client.post(
        "/api/user/onboarding",
        headers=headers,
        json={"liked_movie_ids": [1, 260]},
    )

    # Call reset
    reset_res = await async_client.delete("/api/user/interactions/reset", headers=headers)
    assert reset_res.status_code == 200
    assert reset_res.json()["onboarding_completed"] is False

    # Interactions should now be empty
    list_res = await async_client.get("/api/user/interactions", headers=headers)
    assert len(list_res.json()["interactions"]) == 0


@pytest.mark.asyncio
async def test_admin_benchmark_switching_authorization(async_client):
    """Verify only admin role can switch benchmark MovieLens user ID."""
    reg = await async_client.post(
        "/auth/register",
        json={"email": "admin_tester@example.com", "password": "Password123!"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Standard user attempting benchmark switch -> 403 Forbidden
    unauthorized_res = await async_client.post(
        "/api/admin/set-benchmark-id",
        headers=headers,
        json={"movie_lens_user_id": 100},
    )
    assert unauthorized_res.status_code == 403

    # Attempt to promote without password -> 403 Forbidden
    unauth_promote = await async_client.post("/api/admin/toggle-admin-role", headers=headers)
    assert unauth_promote.status_code == 403

    # Attempt to promote with wrong password -> 403 Forbidden
    wrong_pwd = await async_client.post(
        "/api/admin/toggle-admin-role",
        headers=headers,
        json={"password": "wrongpassword"},
    )
    assert wrong_pwd.status_code == 403

    # Promote to admin with valid password
    promote_res = await async_client.post(
        "/api/admin/toggle-admin-role",
        headers=headers,
        json={"password": "12345qwe"},
    )
    assert promote_res.status_code == 200
    assert promote_res.json()["role"] == "admin"

    # Now authorized -> switch to user #100
    switch_res = await async_client.post(
        "/api/admin/set-benchmark-id",
        headers=headers,
        json={"movie_lens_user_id": 100},
    )
    assert switch_res.status_code == 200
    assert switch_res.json()["movie_lens_user_id"] == 100

    # Switching to an unknown user ID -> 404 Not Found
    unknown_res = await async_client.post(
        "/api/admin/set-benchmark-id",
        headers=headers,
        json={"movie_lens_user_id": 99999999},
    )
    assert unknown_res.status_code == 404

    # Exit admin mode
    exit_res = await async_client.post("/api/admin/exit-admin-mode", headers=headers)
    assert exit_res.status_code == 200
    assert exit_res.json()["role"] == "user"

    # Verify admin verify-password endpoint elevates back to admin
    verify_res = await async_client.post(
        "/api/admin/verify-password",
        headers=headers,
        json={"password": "12345qwe"},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["role"] == "admin"
