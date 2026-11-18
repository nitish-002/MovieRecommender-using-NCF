from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import (
    OnboardingRequest,
    InteractionCreateRequest,
    InteractionItem,
    UserInteractionsResponse,
    SurrogateRecommendRequest,
    SurrogatePredictRequest,
    SurrogatePredictResponse,
    RecommendationResponse,
    RecommendationItem,
    BenchmarkIdRequest,
    AdminRoleRequest,
)
from app.config import settings
from app.services.db import get_db, User, UserInteraction
from app.services.model_service import ModelService
from app.services.movie_service import MovieService
from app.api.auth_routes import get_current_user

router = APIRouter()


@router.post("/user/onboarding")
async def complete_onboarding(
    request: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save initial liked movies during onboarding and mark user taste onboarding as complete."""
    valid_movie_ids = [m for m in request.liked_movie_ids if ModelService.validate_movie(m)]
    if not valid_movie_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="None of the selected movies exist in the catalog.",
        )

    # Clean existing onboarding/liked entries to avoid duplicate rows
    await db.execute(
        delete(UserInteraction).where(
            UserInteraction.user_id == current_user.id,
            UserInteraction.movie_id.in_(valid_movie_ids),
        )
    )

    for m_id in valid_movie_ids:
        interaction = UserInteraction(
            user_id=current_user.id,
            movie_id=m_id,
            interaction_type="liked",
        )
        db.add(interaction)

    current_user.onboarding_completed = True
    await db.commit()

    return {
        "status": "success",
        "message": "Onboarding completed successfully.",
        "liked_count": len(valid_movie_ids),
        "onboarding_completed": True,
    }


@router.post("/user/interactions")
async def record_interaction(
    request: InteractionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add or update an interaction (liked, seen, disliked) for a movie."""
    if not ModelService.validate_movie(request.movie_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie {request.movie_id} not found in catalog.",
        )

    # Check if record already exists
    result = await db.execute(
        select(UserInteraction).where(
            UserInteraction.user_id == current_user.id,
            UserInteraction.movie_id == request.movie_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.interaction_type = request.interaction_type
    else:
        interaction = UserInteraction(
            user_id=current_user.id,
            movie_id=request.movie_id,
            interaction_type=request.interaction_type,
        )
        db.add(interaction)

    if request.interaction_type == "liked":
        current_user.onboarding_completed = True

    await db.commit()

    return {
        "status": "success",
        "movie_id": request.movie_id,
        "interaction_type": request.interaction_type,
    }


@router.delete("/user/interactions/reset")
async def reset_user_taste_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete all recorded movie interactions for the user and reset their onboarding status."""
    await db.execute(
        delete(UserInteraction).where(UserInteraction.user_id == current_user.id)
    )
    current_user.onboarding_completed = False
    await db.commit()

    return {
        "status": "success",
        "message": "User taste profile and all movie interactions have been reset.",
        "onboarding_completed": False,
    }


@router.delete("/user/interactions/{movie_id}")
async def remove_interaction(
    movie_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a user interaction for a specific movie."""
    result = await db.execute(
        delete(UserInteraction).where(
            UserInteraction.user_id == current_user.id,
            UserInteraction.movie_id == movie_id,
        )
    )
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No interaction found for movie {movie_id}",
        )

    return {"status": "success", "message": f"Interaction for movie {movie_id} removed"}


@router.get("/user/interactions", response_model=UserInteractionsResponse)
async def get_user_interactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all movies liked or marked seen by the current user."""
    result = await db.execute(
        select(UserInteraction)
        .where(UserInteraction.user_id == current_user.id)
        .order_by(UserInteraction.created_at.desc())
    )
    interactions = result.scalars().all()

    items: List[InteractionItem] = []
    liked_ids: List[int] = []
    seen_ids: List[int] = []

    for item in interactions:
        meta = MovieService.get_movie_by_id(item.movie_id)
        title = meta["title"] if meta else None
        genres = meta["genres"] if meta else None

        items.append(
            InteractionItem(
                id=item.id,
                movie_id=item.movie_id,
                interaction_type=item.interaction_type,
                title=title,
                genres=genres,
            )
        )
        if item.interaction_type == "liked":
            liked_ids.append(item.movie_id)
        elif item.interaction_type == "seen":
            seen_ids.append(item.movie_id)

    return UserInteractionsResponse(
        interactions=items,
        liked_movie_ids=liked_ids,
        seen_movie_ids=seen_ids,
    )


@router.post("/surrogate/recommend", response_model=RecommendationResponse)
async def surrogate_recommend(request: SurrogateRecommendRequest):
    """Public/ad-hoc endpoint to compute recommendations directly from any list of liked movies."""
    if not ModelService.is_model_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    valid_liked = [m for m in request.liked_movie_ids if ModelService.validate_movie(m)]
    if not valid_liked:
        raise HTTPException(
            status_code=400,
            detail="None of the provided movie IDs exist in the catalog.",
        )

    excluded = set(request.excluded_movie_ids) if request.excluded_movie_ids else set()

    try:
        recommendations = ModelService.recommend_from_liked_movies(
            liked_movie_ids=valid_liked,
            excluded_movie_ids=excluded,
            top_n=request.top_n,
        )
        return RecommendationResponse(
            user_id=0,
            model_version=ModelService.get_model_version(),
            recommendations=[RecommendationItem(**rec) for rec in recommendations],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/surrogate/predict", response_model=SurrogatePredictResponse)
async def surrogate_predict(request: SurrogatePredictRequest):
    """Public/ad-hoc endpoint to predict affinity for a target movie given a list of liked movies."""
    if not ModelService.is_model_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    if not ModelService.validate_movie(request.target_movie_id):
        raise HTTPException(
            status_code=404,
            detail=f"Target movie {request.target_movie_id} not found in catalog.",
        )

    valid_liked = [m for m in request.liked_movie_ids if ModelService.validate_movie(m)]
    if not valid_liked:
        raise HTTPException(
            status_code=400,
            detail="None of the provided liked movie IDs exist in the catalog.",
        )

    try:
        res = ModelService.predict_from_liked_movies(
            liked_movie_ids=valid_liked,
            target_movie_id=request.target_movie_id,
        )
        return SurrogatePredictResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/set-benchmark-id")
async def set_benchmark_user_id(
    request: BenchmarkIdRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allow administrators to set or switch their linked MovieLens benchmark ID."""
    if (current_user.role or "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to configure benchmark MovieLens user IDs.",
        )

    if not ModelService.validate_user(request.movie_lens_user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"MovieLens user ID {request.movie_lens_user_id} does not exist in the model vocabulary.",
        )

    current_user.movie_lens_user_id = request.movie_lens_user_id
    await db.commit()

    return {
        "status": "success",
        "message": f"Benchmark profile successfully updated to MovieLens #{request.movie_lens_user_id}.",
        "movie_lens_user_id": current_user.movie_lens_user_id,
    }


@router.post("/admin/toggle-admin-role")
async def toggle_admin_role(
    request: Optional[AdminRoleRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle the current user's role between 'admin' and 'user'.
    Promoting to 'admin' requires the administrator password."""
    target_role = "user" if current_user.role == "admin" else "admin"

    if target_role == "admin":
        provided_password = request.password if request else None
        if not provided_password or provided_password != settings.admin_password:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect administrator password. Access denied.",
            )

    current_user.role = target_role
    await db.commit()

    return {
        "status": "success",
        "role": current_user.role,
        "message": f"Account role updated to '{target_role}'.",
    }


@router.post("/admin/verify-password")
async def verify_admin_password(
    request: AdminRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify administrator password and elevate current user to admin."""
    if not request.password or request.password != settings.admin_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Incorrect administrator password. Access denied.",
        )

    current_user.role = "admin"
    await db.commit()

    return {
        "status": "success",
        "role": "admin",
        "message": "Administrator mode unlocked successfully.",
    }


@router.post("/admin/exit-admin-mode")
async def exit_admin_mode(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Switch back from 'admin' to standard 'user' role."""
    current_user.role = "user"
    await db.commit()

    return {
        "status": "success",
        "role": "user",
        "message": "Switched back to standard user mode.",
    }

