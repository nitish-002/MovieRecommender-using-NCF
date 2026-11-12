from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.services.db import get_db, User, assign_movie_lens_user_id
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from app.services.model_service import ModelService

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


class PasswordRequest(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_bcrypt_password_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return password


class RegisterRequest(PasswordRequest):
    email: EmailStr


class LoginRequest(PasswordRequest):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    movie_lens_user_id: int


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == request.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        if not ModelService._user2idx:
            raise HTTPException(
                status_code=503,
                detail="MovieLens user mappings are unavailable. Check the model artifacts.",
            )

        movie_lens_user_id = await assign_movie_lens_user_id(
            db, valid_ids=list(ModelService._user2idx.keys())
        )

        user = User(
            email=request.email,
            password_hash=hash_password(request.password),
            movie_lens_user_id=movie_lens_user_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.exception("Registration failed because the database operation failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Registration is temporarily unavailable. Check the backend database connection and schema.",
        ) from exc

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        movie_lens_user_id=current_user.movie_lens_user_id,
    )
