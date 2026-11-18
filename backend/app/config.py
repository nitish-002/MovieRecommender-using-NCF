from pathlib import Path
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent


def get_default_artifacts_dir() -> str:
    if (BACKEND_DIR / "model_artifacts").exists():
        return str(BACKEND_DIR / "model_artifacts")
    if Path("./model_artifacts").exists():
        return "./model_artifacts"
    return "./backend/model_artifacts"


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5433/movie_recommender"
    model_artifacts_dir: str = get_default_artifacts_dir()
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"
    environment: str = "development"  # "development" | "production"
    admin_password: str = "12345qwe"
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_days: int = 7
    cors_origins: str = "*"

    @field_validator("database_url", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: str) -> str:
        """Ensure standard Postgres URLs from cloud providers work with asyncpg."""
        if isinstance(v, str):
            cleaned = v.strip()
            if cleaned.startswith("postgres://"):
                return cleaned.replace("postgres://", "postgresql+asyncpg://", 1)
            elif cleaned.startswith("postgresql://") and not cleaned.startswith("postgresql+asyncpg://"):
                return cleaned.replace("postgresql://", "postgresql+asyncpg://", 1)
            return cleaned
        return v

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.cors_origins or self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = (str(BACKEND_DIR / ".env"), "backend/.env", ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()