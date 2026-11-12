import secrets
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, func, select

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    movie_lens_user_id = Column(Integer, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


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
    result = await db.execute(select(User.movie_lens_user_id))
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
    result = await db.execute(select(User.movie_lens_user_id))
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