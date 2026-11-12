import pytest
from app.services.model_service import ModelService


@pytest.fixture(scope="module", autouse=True)
def setup_model_service():
    """Ensure artifacts are loaded once for all tests in this module."""
    ModelService.load_artifacts()
    assert ModelService.is_model_loaded()


def test_model_service_initialization_state():
    """Verify ModelService has loaded checkpoint, mappings, and vocabulary."""
    assert ModelService.is_model_loaded() is True
    assert ModelService.get_model_version() is not None
    assert len(ModelService._user2idx) > 0
    assert len(ModelService._movie2idx) > 0
    assert not ModelService.get_movie_metadata().empty


def test_validate_user_known_and_unknown():
    """Verify validate_user accurately identifies valid and invalid user IDs."""
    sample_user = next(iter(ModelService._user2idx))
    assert ModelService.validate_user(sample_user) is True

    unknown_user = 999_999_999
    assert ModelService.validate_user(unknown_user) is False


def test_validate_movie_known_and_unknown():
    """Verify validate_movie accurately identifies valid and invalid movie IDs."""
    sample_movie = next(iter(ModelService._movie2idx))
    assert ModelService.validate_movie(sample_movie) is True

    unknown_movie = 999_999_999
    assert ModelService.validate_movie(unknown_movie) is False


def test_recommend_top_n_schema_and_ordering():
    """Verify recommend_top_n produces ordered, valid recommendations matching requested count."""
    sample_user = next(iter(ModelService._user2idx))
    top_n = 10
    recs = ModelService.recommend_top_n(sample_user, top_n=top_n)

    assert len(recs) == top_n, f"Expected {top_n} recommendations, got {len(recs)}"

    prev_score = float("inf")
    for idx, item in enumerate(recs, start=1):
        assert item["rank"] == idx, f"Rank mismatch at index {idx}"
        assert "movie_id" in item
        assert "title" in item
        assert isinstance(item["genres"], list)
        assert "score" in item

        score = item["score"]
        assert 0.0 <= score <= 1.0, f"Score out of range: {score}"
        assert score <= prev_score, f"Recommendations are not sorted descending by score: {score} > {prev_score}"
        prev_score = score


def test_recommend_top_n_variable_sizes():
    """Verify recommend_top_n honors top_n=5 and top_n=20."""
    sample_user = next(iter(ModelService._user2idx))

    recs_5 = ModelService.recommend_top_n(sample_user, top_n=5)
    assert len(recs_5) == 5

    recs_20 = ModelService.recommend_top_n(sample_user, top_n=20)
    assert len(recs_20) == 20


def test_recommend_top_n_unknown_user_raises_key_error():
    """Verify recommend_top_n raises KeyError when given an unknown user ID."""
    with pytest.raises(KeyError):
        ModelService.recommend_top_n(user_id=999_999_999, top_n=10)


def test_recommend_top_n_invalid_k_raises_value_error():
    """Verify recommend_top_n raises ValueError for non-positive or excessive k."""
    sample_user = next(iter(ModelService._user2idx))

    with pytest.raises(ValueError):
        ModelService.recommend_top_n(sample_user, top_n=0)

    with pytest.raises(ValueError):
        ModelService.recommend_top_n(sample_user, top_n=101)


def test_predict_preference_valid_pair():
    """Verify predict_preference computes a valid probability for a known user and movie."""
    sample_user = next(iter(ModelService._user2idx))
    sample_movie = next(iter(ModelService._movie2idx))

    result = ModelService.predict_preference(sample_user, sample_movie)

    assert result["user_id"] == sample_user
    assert result["movie_id"] == sample_movie
    assert result["prediction_type"] == "preference_score"
    assert "score" in result
    assert 0.0 <= result["score"] <= 1.0
    assert "model_version" in result


def test_predict_preference_unknown_user_raises_key_error():
    """Verify predict_preference raises KeyError for an unknown user."""
    sample_movie = next(iter(ModelService._movie2idx))
    with pytest.raises(KeyError):
        ModelService.predict_preference(user_id=999_999_999, movie_id=sample_movie)


def test_predict_preference_unknown_movie_raises_key_error():
    """Verify predict_preference raises KeyError for an unknown movie."""
    sample_user = next(iter(ModelService._user2idx))
    with pytest.raises(KeyError):
        ModelService.predict_preference(user_id=sample_user, movie_id=999_999_999)


def test_get_metrics_and_config():
    """Verify metrics and config getters return non-empty dictionaries."""
    metrics = ModelService.get_metrics()
    config = ModelService.get_config()

    assert isinstance(metrics, dict)
    assert isinstance(config, dict)
    assert len(config) > 0

