import pandas as pd
from typing import List, Dict, Optional

from app.services.model_service import ModelService


class MovieService:
    _movies_df: Optional[pd.DataFrame] = None

    @classmethod
    def initialize(cls):
        cls._movies_df = ModelService.get_movie_metadata()

    @classmethod
    def search_movies(cls, query: str, limit: int = 20) -> List[Dict]:
        if cls._movies_df is None or cls._movies_df.empty:
            cls.initialize()
        
        if cls._movies_df is None or cls._movies_df.empty:
            return []

        query_lower = query.lower().strip()
        
        mask = (
            cls._movies_df["title"].str.lower().str.contains(query_lower, na=False)
        )
        
        results = cls._movies_df[mask].head(limit)
        
        movies = []
        for _, row in results.iterrows():
            genres = row["genres"].split("|") if isinstance(row["genres"], str) else []
            movies.append({
                "movie_id": int(row["movieId"]),
                "title": row["title"],
                "genres": genres,
            })
        
        return movies

    @classmethod
    def get_movie_by_id(cls, movie_id: int) -> Optional[Dict]:
        if cls._movies_df is None or cls._movies_df.empty:
            cls.initialize()
        
        if cls._movies_df is None or cls._movies_df.empty:
            return None
        
        row = cls._movies_df[cls._movies_df["movieId"] == movie_id]
        if row.empty:
            return None
        
        row = row.iloc[0]
        genres = row["genres"].split("|") if isinstance(row["genres"], str) else []
        return {
            "movie_id": int(row["movieId"]),
            "title": row["title"],
            "genres": genres,
        }

    @classmethod
    def get_all_movies(cls, limit: int = 100) -> List[Dict]:
        if cls._movies_df is None or cls._movies_df.empty:
            cls.initialize()
        
        if cls._movies_df is None or cls._movies_df.empty:
            return []
        
        results = cls._movies_df.head(limit)
        
        movies = []
        for _, row in results.iterrows():
            genres = row["genres"].split("|") if isinstance(row["genres"], str) else []
            movies.append({
                "movie_id": int(row["movieId"]),
                "title": row["title"],
                "genres": genres,
            })
        
        return movies