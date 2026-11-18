import pytest
import pytest_asyncio
import torch
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.services.db import Base, User, UserInteraction
from app.services.model_service import ModelService


@pytest.fixture(scope="module", autouse=True)
def setup_artifacts():
    ModelService.load_artifacts()


def test_forward_with_surrogate_tensor_shapes():
    """Verify forward_with_surrogate handles single and batch candidate items."""
    model = ModelService._model
    assert model is not None
    model.eval()

    device = ModelService._device
    surrogate_gmf = torch.randn(1, 32, device=device)
    surrogate_mlp = torch.randn(1, 32, device=device)
    candidates = torch.tensor([0, 1, 2, 3, 4], dtype=torch.long, device=device)

    with torch.no_grad():
        logits = model.forward_with_surrogate(surrogate_gmf, surrogate_mlp, candidates)
        probs = torch.sigmoid(logits)

    assert logits.shape == (5,)
    assert (probs >= 0.0).all() and (probs <= 1.0).all()


def test_surrogate_recommend_from_liked_movies_success():
    """Verify generating dynamic recommendations from 3 liked movies."""
    # Toy Story (1), Star Wars IV (260), The Matrix (2571)
    liked = [1, 260, 2571]
    recs = ModelService.recommend_from_liked_movies(liked_movie_ids=liked, top_n=10)

    assert len(recs) == 10
    # Strict descending score ordering
    scores = [r["score"] for r in recs]
    assert scores == sorted(scores, reverse=True)

    # Ensure required schema keys
    for r in recs:
        assert "rank" in r
        assert "movie_id" in r
        assert "title" in r
        assert "genres" in r
        assert "score" in r
        assert 0.0 <= r["score"] <= 1.0


def test_surrogate_recommend_excludes_liked_and_seen_movies():
    """Verify that liked and marked seen movies are excluded from recommendations."""
    liked = [1, 260]
    seen = {1196, 1210}  # Empire Strikes Back, Return of the Jedi

    recs = ModelService.recommend_from_liked_movies(
        liked_movie_ids=liked,
        excluded_movie_ids=seen,
        top_n=20,
    )

    rec_ids = {r["movie_id"] for r in recs}
    for m in liked:
        assert m not in rec_ids, f"Liked movie {m} should be excluded"
    for m in seen:
        assert m not in rec_ids, f"Seen movie {m} should be excluded"


def test_surrogate_recommend_variable_top_n():
    """Verify top_n parameter accurately controls result count."""
    liked = [1, 500]
    recs_5 = ModelService.recommend_from_liked_movies(liked_movie_ids=liked, top_n=5)
    recs_15 = ModelService.recommend_from_liked_movies(liked_movie_ids=liked, top_n=15)

    assert len(recs_5) == 5
    assert len(recs_15) == 15


def test_surrogate_recommend_invalid_top_n_raises():
    """Verify invalid top_n bounds raise ValueError."""
    with pytest.raises(ValueError, match="top_n must be between 1 and 100"):
        ModelService.recommend_from_liked_movies(liked_movie_ids=[1], top_n=0)

    with pytest.raises(ValueError, match="top_n must be between 1 and 100"):
        ModelService.recommend_from_liked_movies(liked_movie_ids=[1], top_n=101)


def test_surrogate_recommend_invalid_or_empty_movies_raises():
    """Verify providing non-existent movie IDs raises ValueError."""
    with pytest.raises(ValueError, match="None of the provided movie IDs exist"):
        ModelService.recommend_from_liked_movies(liked_movie_ids=[99999999, 88888888])

    with pytest.raises(ValueError, match="None of the provided movie IDs exist"):
        ModelService.recommend_from_liked_movies(liked_movie_ids=[])


def test_surrogate_predict_preference_success():
    """Verify single target movie preference calculation using surrogate vector."""
    liked = [1, 260]
    target = 1196  # Empire Strikes Back

    res = ModelService.predict_from_liked_movies(liked_movie_ids=liked, target_movie_id=target)

    assert res["target_movie_id"] == target
    assert res["prediction_type"] == "surrogate_preference_score"
    assert 0.0 <= res["score"] <= 1.0
    assert res["liked_movies_count"] == 2


def test_surrogate_predict_unknown_target_raises():
    """Verify predicting an unknown target movie raises KeyError."""
    with pytest.raises(KeyError, match="outside the trained vocabulary"):
        ModelService.predict_from_liked_movies(liked_movie_ids=[1], target_movie_id=99999999)


@pytest.mark.asyncio
async def test_user_interaction_db_lifecycle():
    """Verify User and UserInteraction persistence in SQLite."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Create a dynamic user without MovieLens ID
        user = User(
            email="dynamic@example.com",
            password_hash="fakehash123",
            movie_lens_user_id=None,
            role="user",
            onboarding_completed=False,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        assert user.id is not None
        assert user.movie_lens_user_id is None
        assert user.onboarding_completed is False

        # Add interactions
        interaction1 = UserInteraction(
            user_id=user.id,
            movie_id=1,
            interaction_type="liked",
        )
        interaction2 = UserInteraction(
            user_id=user.id,
            movie_id=260,
            interaction_type="seen",
        )
        session.add_all([interaction1, interaction2])
        await session.commit()

        # Query interactions
        result = await session.execute(
            select(UserInteraction).where(UserInteraction.user_id == user.id)
        )
        interactions = result.scalars().all()
        assert len(interactions) == 2
        types = {i.interaction_type for i in interactions}
        assert types == {"liked", "seen"}

    await engine.dispose()
