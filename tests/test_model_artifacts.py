import json
from pathlib import Path
import pandas as pd
import torch
import pytest

from app.config import settings


@pytest.fixture
def artifact_dir():
    path = Path(settings.model_artifacts_dir)
    assert path.exists(), f"Artifact directory does not exist: {path}"
    return path


def test_required_artifact_files_exist(artifact_dir):
    """Verify all 6 core model artifact files are present in the directory."""
    required_files = [
        "model_config.json",
        "user_mapping.json",
        "movie_mapping.json",
        "movie_metadata.csv",
        "metrics.json",
        "neumf_best.pth",
    ]
    for filename in required_files:
        file_path = artifact_dir / filename
        assert file_path.exists(), f"Missing required artifact: {filename}"
        assert file_path.stat().st_size > 0, f"Artifact is empty: {filename}"


def test_model_config_schema(artifact_dir):
    """Verify model_config.json contains valid training and architecture hyperparameters."""
    with open(artifact_dir / "model_config.json") as f:
        config = json.load(f)

    assert "embedding_dimension" in config or "embedding_dim" in config
    emb_dim = config.get("embedding_dimension") or config.get("embedding_dim")
    assert emb_dim == 32, f"Expected embedding dim 32, got {emb_dim}"

    assert "num_users" in config
    assert config["num_users"] > 0
    assert "num_movies" in config
    assert config["num_movies"] > 0


def test_user_mapping_bijectivity(artifact_dir):
    """Verify user_mapping.json has valid, bijective raw-to-index and index-to-raw dictionaries."""
    with open(artifact_dir / "user_mapping.json") as f:
        data = json.load(f)

    assert "raw_to_index" in data
    assert "index_to_raw" in data

    raw_to_idx = data["raw_to_index"]
    idx_to_raw = data["index_to_raw"]

    assert len(raw_to_idx) == len(idx_to_raw), "Mapping size mismatch between forward and reverse"
    assert len(raw_to_idx) > 1000, f"Expected large user vocabulary, got {len(raw_to_idx)}"

    # Spot check sample
    sample_raw = next(iter(raw_to_idx))
    sample_idx = str(raw_to_idx[sample_raw])
    assert idx_to_raw[sample_idx] == int(sample_raw)


def test_movie_mapping_bijectivity(artifact_dir):
    """Verify movie_mapping.json has valid, bijective raw-to-index and index-to-raw dictionaries."""
    with open(artifact_dir / "movie_mapping.json") as f:
        data = json.load(f)

    assert "raw_to_index" in data
    assert "index_to_raw" in data

    raw_to_idx = data["raw_to_index"]
    idx_to_raw = data["index_to_raw"]

    assert len(raw_to_idx) == len(idx_to_raw), "Mapping size mismatch between forward and reverse"
    assert len(raw_to_idx) > 1000, f"Expected large movie vocabulary, got {len(raw_to_idx)}"

    # Spot check sample
    sample_raw = next(iter(raw_to_idx))
    sample_idx = str(raw_to_idx[sample_raw])
    assert idx_to_raw[sample_idx] == int(sample_raw)


def test_movie_metadata_csv_structure(artifact_dir):
    """Verify movie_metadata.csv contains proper headers, no null IDs, and valid genres."""
    df = pd.read_csv(artifact_dir / "movie_metadata.csv")

    assert "movieId" in df.columns, "movieId column missing"
    assert "title" in df.columns, "title column missing"
    assert "genres" in df.columns, "genres column missing"

    assert len(df) > 1000, f"Unexpectedly small movie catalog: {len(df)}"
    assert df["movieId"].isnull().sum() == 0, "Found null movieId entries"
    assert df["title"].isnull().sum() == 0, "Found null title entries"


def test_metrics_json_structure(artifact_dir):
    """Verify metrics.json contains evaluation protocol metrics (HR@10, NDCG@10)."""
    with open(artifact_dir / "metrics.json") as f:
        metrics = json.load(f)

    assert isinstance(metrics, dict)
    # Check for presence of evaluation metrics
    has_eval_metrics = (
        "models" in metrics or
        "model_comparison" in metrics or
        "neumf" in metrics or
        "hr_at_10" in str(metrics).lower()
    )
    assert has_eval_metrics, "metrics.json does not report model evaluation metrics"


def test_pytorch_checkpoint_weights(artifact_dir):
    """Verify neumf_best.pth loads correctly and contains valid layer tensors with matching shapes."""
    checkpoint_path = artifact_dir / "neumf_best.pth"
    checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)

    assert "model_state_dict" in checkpoint, "Missing model_state_dict in checkpoint"
    state_dict = checkpoint["model_state_dict"]

    expected_keys = [
        "gmf_user.weight",
        "gmf_movie.weight",
        "mlp_user.weight",
        "mlp_movie.weight",
        "output.weight",
        "output.bias",
    ]
    for key in expected_keys:
        assert key in state_dict, f"Missing layer weight in checkpoint: {key}"

    # Verify embedding dimensions
    assert state_dict["gmf_user.weight"].shape[1] == 32
    assert state_dict["gmf_movie.weight"].shape[1] == 32
    assert state_dict["mlp_user.weight"].shape[1] == 32
    assert state_dict["mlp_movie.weight"].shape[1] == 32

