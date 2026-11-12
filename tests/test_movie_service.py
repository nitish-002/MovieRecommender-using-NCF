import pytest
from app.services.model_service import ModelService
from app.services.movie_service import MovieService


@pytest.fixture(scope="module", autouse=True)
def setup_services():
    """Ensure ModelService and MovieService are initialized."""
    ModelService.load_artifacts()
    MovieService.initialize()


def test_search_movies_exact_and_partial():
    """Verify movie search finds movies by full title or partial keyword."""
    results = MovieService.search_movies("Toy Story", limit=10)
    assert len(results) > 0
    titles = [m["title"] for m in results]
    assert any("Toy Story" in t for t in titles)


def test_search_movies_case_insensitivity():
    """Verify movie search is case-insensitive."""
    res_lower = MovieService.search_movies("toy story", limit=5)
    res_mixed = MovieService.search_movies("tOy StOrY", limit=5)
    res_upper = MovieService.search_movies("TOY STORY", limit=5)

    assert len(res_lower) == len(res_mixed) == len(res_upper)
    assert [m["movie_id"] for m in res_lower] == [m["movie_id"] for m in res_mixed]


def test_search_movies_respects_limit():
    """Verify movie search respects the limit argument."""
    res_2 = MovieService.search_movies("the", limit=2)
    assert len(res_2) == 2

    res_7 = MovieService.search_movies("the", limit=7)
    assert len(res_7) == 7


def test_search_movies_no_results():
    """Verify search returns an empty list when no titles match."""
    results = MovieService.search_movies("xyznonexistentmovie9999", limit=10)
    assert results == []


def test_get_movie_by_id_known():
    """Verify get_movie_by_id returns metadata for a known movie ID."""
    movie = MovieService.get_movie_by_id(1)
    assert movie is not None
    assert movie["movie_id"] == 1
    assert "Toy Story" in movie["title"]
    assert isinstance(movie["genres"], list)
    assert "Animation" in movie["genres"]


def test_get_movie_by_id_unknown():
    """Verify get_movie_by_id returns None for non-existent movie IDs."""
    movie = MovieService.get_movie_by_id(999_999_999)
    assert movie is None


def test_get_all_movies_limit():
    """Verify get_all_movies returns catalog items up to requested limit."""
    movies = MovieService.get_all_movies(limit=15)
    assert len(movies) == 15
    for m in movies:
        assert "movie_id" in m
        assert "title" in m
        assert isinstance(m["genres"], list)

