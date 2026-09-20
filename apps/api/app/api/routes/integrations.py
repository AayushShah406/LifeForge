from datetime import datetime, timezone
from typing import Any, Dict, List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, User, Integration
from app.api.deps import get_current_user
from app.schemas.integration import IntegrationStatus, IntegrationConnectRequest

router = APIRouter(prefix="/integrations", tags=["Integrations"])


def _format_integration(integ: Integration) -> Dict[str, Any]:
    meta = integ.metadata_info or {}
    return {
        "id": integ.id,
        "provider": integ.provider,
        "is_connected": integ.is_connected,
        "is_simulated": integ.is_sandbox_simulated,
        "account_email": meta.get("account_email", "user@lifeforge.ai"),
        "last_synced_at": integ.updated_at,
        "settings_data": meta.get("settings_data", {"mode": "sandbox", "auto_sync": True})
    }


@router.get("", response_model=List[IntegrationStatus])
async def list_integrations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List status of all Google Workspace integrations."""
    stmt = select(Integration).where(Integration.user_id == user.id)
    res = await db.execute(stmt)
    integrations = res.scalars().all()

    if not integrations:
        default_providers = ["google_calendar", "gmail", "google_drive"]
        seeded = []
        for p in default_providers:
            integ = Integration(
                id=str(uuid.uuid4()),
                user_id=user.id,
                provider=p,
                is_connected=True,
                is_sandbox_simulated=True,
                metadata_info={"account_email": user.email, "settings_data": {"mode": "sandbox", "auto_sync": True}}
            )
            db.add(integ)
            seeded.append(integ)
        await db.commit()
        return [_format_integration(i) for i in seeded]

    return [_format_integration(i) for i in integrations]


@router.post("/google/connect", response_model=IntegrationStatus)
async def connect_google_integration(
    payload: IntegrationConnectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Connect or simulate a Google service."""
    stmt = select(Integration).where(Integration.user_id == user.id, Integration.provider == payload.provider)
    res = await db.execute(stmt)
    integ = res.scalar_one_or_none()

    if not integ:
        integ = Integration(
            id=str(uuid.uuid4()),
            user_id=user.id,
            provider=payload.provider,
            is_connected=True,
            is_sandbox_simulated=payload.use_simulation,
            metadata_info={"account_email": payload.account_email, "settings_data": {"mode": "sandbox", "auto_sync": True}}
        )
        db.add(integ)
    else:
        integ.is_connected = True
        integ.is_sandbox_simulated = payload.use_simulation
        integ.metadata_info = {"account_email": payload.account_email, "settings_data": {"mode": "sandbox", "auto_sync": True}}

    await db.commit()
    await db.refresh(integ)
    return _format_integration(integ)
