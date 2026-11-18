import secrets
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func, select

from app.config import settings

_connect_args = {"timeout": 2.0} if "asyncpg" in settings.database_url else {}
engine = create_async_engine(settings.database_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    movie_lens_user_id = Column(Integer, unique=True, index=True, nullable=True)
    role = Column(String(50), default="user", nullable=False)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    interactions = relationship("UserInteraction", backref="user", cascade="all, delete-orphan")


class UserInteraction(Base):
    __tablename__ = "user_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    movie_id = Column(Integer, index=True, nullable=False)
    interaction_type = Column(String(50), nullable=False)  # "liked", "seen", "disliked"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Apply lightweight schema updates for existing databases (PostgreSQL)
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE users ALTER COLUMN movie_lens_user_id DROP NOT NULL;"))
        except Exception:
            # Gracefully ignored for in-memory SQLite tests or already altered tables
            pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_available_movie_lens_ids(
    db: AsyncSession,
    valid_ids: list[int] | set[int] | None = None,
    min_id: int | None = None,
    max_id: int | None = None,
) -> list[int]:
    result = await db.execute(select(User.movie_lens_user_id).where(User.movie_lens_user_id.is_not(None)))
    assigned = set(result.scalars().all())

    if valid_ids is not None:
        candidate_ids = valid_ids
    elif min_id is not None and max_id is not None:
        candidate_ids = range(min_id, max_id + 1)
    else:
        raise ValueError("Either valid_ids or (min_id, max_id) must be provided")

    return [i for i in candidate_ids if i not in assigned]


async def assign_movie_lens_user_id(
    db: AsyncSession,
    valid_ids: list[int] | set[int] | None = None,
    min_id: int | None = None,
    max_id: int | None = None,
) -> int:
    result = await db.execute(select(User.movie_lens_user_id).where(User.movie_lens_user_id.is_not(None)))
    assigned = set(result.scalars().all())

    if valid_ids is not None:
        candidate_list = list(valid_ids)
    elif min_id is not None and max_id is not None:
        candidate_list = list(range(min_id, max_id + 1))
    else:
        raise ValueError("Either valid_ids or (min_id, max_id) must be provided")

    if not candidate_list:
        raise RuntimeError("No candidate MovieLens user IDs provided")

    # Fast O(1) sampling when candidates are largely unassigned
    if len(assigned) < len(candidate_list):
        for _ in range(100):
            pick = secrets.choice(candidate_list)
            if pick not in assigned:
                return pick

    available = [uid for uid in candidate_list if uid not in assigned]
    if not available:
        raise RuntimeError("No available MovieLens user IDs to assign")
    return secrets.choice(available)