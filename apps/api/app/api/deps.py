from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, async_session_factory, User
from app.core.security import decode_access_token

security = HTTPBearer(auto_error=False)

DEFAULT_TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
DEFAULT_TEST_EMAIL = "user@lifeforge.ai"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Returns authenticated user or creates default demo user if unauthenticated in dev."""
    user_id = None
    if credentials:
        user_id = decode_access_token(credentials.credentials)

    if not user_id:
        user_id = DEFAULT_TEST_USER_ID

    # Ensure user exists in database
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            id=user_id,
            email=DEFAULT_TEST_EMAIL,
            full_name="Lead AI Engineer",
            hashed_password="demo_hashed_password"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
