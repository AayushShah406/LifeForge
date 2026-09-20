from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, User, UserProfile
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


@router.get("/me")
async def get_my_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve authenticated user details and profile."""
    stmt = select(UserProfile).where(UserProfile.user_id == user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name or (profile.display_name if profile else None),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "profile": {
            "display_name": profile.display_name if profile else user.full_name,
            "avatar_url": profile.avatar_url if profile else None,
            "timezone": profile.timezone if profile else "UTC",
            "preferences": profile.preferences if profile else {}
        } if profile else None
    }


@router.patch("/me")
async def update_my_profile(
    payload: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile and preferences."""
    stmt = select(UserProfile).where(UserProfile.user_id == user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        profile = UserProfile(
            user_id=user.id,
            display_name=payload.display_name or user.full_name,
            avatar_url=payload.avatar_url,
            timezone=payload.timezone or "UTC",
            preferences=payload.preferences or {}
        )
        db.add(profile)
    else:
        if payload.display_name is not None:
            profile.display_name = payload.display_name
            user.full_name = payload.display_name
        if payload.avatar_url is not None:
            profile.avatar_url = payload.avatar_url
        if payload.timezone is not None:
            profile.timezone = payload.timezone
        if payload.preferences is not None:
            profile.preferences = payload.preferences

    await db.commit()
    return {"status": "updated", "user_id": user.id}
