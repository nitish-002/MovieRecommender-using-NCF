import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import torch
import torch.nn as nn
import numpy as np
import pandas as pd

from app.config import settings


class NeuMF(nn.Module):
    def __init__(
        self,
        n_users: int,
        n_movies: int,
        embedding_dim: int = 32,
        mlp_hidden_dims: Tuple[int, ...] = (64, 32, 16, 8),
        dropout: float = 0.2,
    ):
        super().__init__()
        self.gmf_user = nn.Embedding(n_users, embedding_dim)
        self.gmf_movie = nn.Embedding(n_movies, embedding_dim)
        self.mlp_user = nn.Embedding(n_users, embedding_dim)
        self.mlp_movie = nn.Embedding(n_movies, embedding_dim)

        layers = []
        width = embedding_dim * 2
        for hidden in mlp_hidden_dims:
            layers.extend([nn.Linear(width, hidden), nn.ReLU(), nn.Dropout(dropout)])
            width = hidden
        self.mlp = nn.Sequential(*layers)
        self.output = nn.Linear(embedding_dim + mlp_hidden_dims[-1], 1)

        for layer in self.modules():
            if isinstance(layer, nn.Embedding):
                nn.init.normal_(layer.weight, mean=0.0, std=0.01)
            elif isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight)
                nn.init.zeros_(layer.bias)

    def forward(self, user_idx: torch.Tensor, movie_idx: torch.Tensor) -> torch.Tensor:
        gmf = self.gmf_user(user_idx) * self.gmf_movie(movie_idx)
        pair = torch.cat([self.mlp_user(user_idx), self.mlp_movie(movie_idx)], dim=1)
        mlp = self.mlp(pair)
        return self.output(torch.cat([gmf, mlp], dim=1)).squeeze(1)


class ModelService:
    _instance = None
    _model: Optional[NeuMF] = None
    _model_loaded = False
    _model_version = "1.0.0"
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    _user2idx: Dict[int, int] = {}
    _idx2user: Dict[int, int] = {}
    _movie2idx: Dict[int, int] = {}
    _idx2movie: Dict[int, int] = {}
    _num_users: int = 0
    _num_movies: int = 0
    _movie_metadata: pd.DataFrame = pd.DataFrame()
    _config: Dict = {}
    _metrics: Dict = {}
    _positive_threshold: float = 3.5
    _train_seen: Dict[int, set] = {}

    @classmethod
    def load_artifacts(cls):
        artifact_dir = Path(settings.model_artifacts_dir)
        
        with open(artifact_dir / "model_config.json") as f:
            cls._config = json.load(f)
        
        with open(artifact_dir / "user_mapping.json") as f:
            user_mapping = json.load(f)
            cls._user2idx = {int(k): int(v) for k, v in user_mapping["raw_to_index"].items()}
            cls._idx2user = {int(k): int(v) for k, v in user_mapping["index_to_raw"].items()}
        
        with open(artifact_dir / "movie_mapping.json") as f:
            movie_mapping = json.load(f)
            cls._movie2idx = {int(k): int(v) for k, v in movie_mapping["raw_to_index"].items()}
            cls._idx2movie = {int(k): int(v) for k, v in movie_mapping["index_to_raw"].items()}
        
        cls._num_users = cls._config.get("num_users", len(cls._user2idx))
        cls._num_movies = cls._config.get("num_movies", len(cls._movie2idx))
        cls._positive_threshold = cls._config.get("positive_threshold", 3.5)

        metadata_path = artifact_dir / "movie_metadata.csv"
        if metadata_path.exists():
            cls._movie_metadata = pd.read_csv(metadata_path)
        else:
            cls._movie_metadata = pd.DataFrame(columns=["movieId", "title", "genres"])

        with open(artifact_dir / "metrics.json") as f:
            cls._metrics = json.load(f)

        cls._load_training_history()

        model_path = artifact_dir / "neumf_best.pth"
        if model_path.exists():
            cls._load_model(model_path)
        else:
            print("Model checkpoint not found. Model will be loaded when training completes.")

    @classmethod
    def _load_training_history(cls):
        artifact_dir = Path(settings.model_artifacts_dir)
        history_path = artifact_dir / "training_history.json"
        if history_path.exists():
            with open(history_path) as f:
                cls._training_history = json.load(f)
        else:
            cls._training_history = {}

    @classmethod
    def _load_model(cls, model_path: Path):
        try:
            embedding_dim = cls._config.get("embedding_dimension", 32)
            model = NeuMF(
                n_users=cls._num_users,
                n_movies=cls._num_movies,
                embedding_dim=embedding_dim,
            )
            checkpoint = torch.load(model_path, map_location=cls._device)
            model.load_state_dict(checkpoint["model_state_dict"])
            model.to(cls._device)
            model.eval()
            cls._model = model
            cls._model_loaded = True
            cls._model_version = checkpoint.get("model_version", "1.0.0")
            print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Failed to load model: {e}")
            cls._model_loaded = False

    @classmethod
    def is_model_loaded(cls) -> bool:
        return cls._model_loaded

    @classmethod
    def get_model_version(cls) -> str:
        return cls._model_version

    @classmethod
    def get_config(cls) -> Dict:
        return cls._config

    @classmethod
    def get_metrics(cls) -> Dict:
        return cls._metrics

    @classmethod
    def get_movie_metadata(cls) -> pd.DataFrame:
        return cls._movie_metadata

    @classmethod
    def validate_user(cls, user_id: int) -> bool:
        return user_id in cls._user2idx

    @classmethod
    def validate_movie(cls, movie_id: int) -> bool:
        return movie_id in cls._movie2idx

    @classmethod
    def get_user_seen_movies(cls, user_id: int) -> set:
        if user_id not in cls._user2idx:
            return set()
        user_idx = cls._user2idx[user_id]
        return cls._train_seen.get(user_idx, set())

    @classmethod
    def recommend_top_n(
        cls,
        user_id: int,
        top_n: int = 10,
        score_batch_size: int = 8192,
    ) -> List[Dict]:
        if not cls._model_loaded:
            raise RuntimeError("Model not loaded. Please train the model first.")
        
        if user_id not in cls._user2idx:
            raise KeyError(f"Unknown or ineligible user ID: {user_id}")
        
        if not 1 <= top_n <= 100:
            raise ValueError("top_n must be between 1 and 100")

        user_idx = cls._user2idx[user_id]
        seen = cls.get_user_seen_movies(user_id)
        
        items = np.array([i for i in range(cls._num_movies) if i not in seen], dtype=np.int64)
        
        if len(items) == 0:
            return []

        model = cls._model
        model.eval()
        parts = []
        
        with torch.inference_mode():
            for start in range(0, len(items), score_batch_size):
                batch = items[start:start + score_batch_size]
                users = torch.full((len(batch),), user_idx, dtype=torch.long, device=cls._device)
                item_tensor = torch.as_tensor(batch, dtype=torch.long, device=cls._device)
                logits = model(users, item_tensor)
                scores = torch.sigmoid(logits).cpu().numpy()
                parts.append(scores)
        
        scores = np.concatenate(parts)
        top_k = min(top_n, len(scores))
        positions = np.argpartition(-scores, top_k - 1)[:top_k]
        positions = positions[np.argsort(-scores[positions])]
        
        raw_movies = [cls._idx2movie[int(items[pos])] for pos in positions]
        
        result = cls._movie_metadata[cls._movie_metadata["movieId"].isin(raw_movies)][
            ["movieId", "title", "genres"]
        ].copy()
        
        score_by_movie = {int(cls._idx2movie[int(items[pos])]): float(scores[pos]) for pos in positions}
        result["preference_score"] = result["movieId"].map(score_by_movie)
        result = result.sort_values("preference_score", ascending=False).reset_index(drop=True)
        result.insert(0, "rank", np.arange(1, len(result) + 1))
        
        recommendations = []
        for _, row in result.iterrows():
            genres = row["genres"].split("|") if isinstance(row["genres"], str) else []
            recommendations.append({
                "rank": int(row["rank"]),
                "movie_id": int(row["movieId"]),
                "title": row["title"],
                "genres": genres,
                "score": float(row["preference_score"]),
            })
        
        return recommendations

    @classmethod
    def predict_preference(cls, user_id: int, movie_id: int) -> Dict:
        if not cls._model_loaded:
            raise RuntimeError("Model not loaded. Please train the model first.")
        
        if user_id not in cls._user2idx:
            raise KeyError(f"Unknown or ineligible user ID: {user_id}")
        
        if movie_id not in cls._movie2idx:
            raise KeyError(f"Movie is outside the trained vocabulary: {movie_id}")
        
        model = cls._model
        model.eval()
        
        with torch.inference_mode():
            logits = model(
                torch.tensor([cls._user2idx[user_id]], dtype=torch.long, device=cls._device),
                torch.tensor([cls._movie2idx[movie_id]], dtype=torch.long, device=cls._device),
            )
            score = torch.sigmoid(logits).item()
        
        return {
            "user_id": user_id,
            "movie_id": movie_id,
            "prediction_type": "preference_score",
            "score": float(score),
            "model_version": cls._model_version,
        }