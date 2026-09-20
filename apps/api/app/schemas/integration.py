from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class IntegrationStatus(BaseModel):
    id: str
    provider: str
    is_connected: bool
    is_simulated: bool
    account_email: Optional[str]
    last_synced_at: Optional[datetime]
    settings_data: Dict[str, Any]

    class Config:
        from_attributes = True


class IntegrationConnectRequest(BaseModel):
    provider: str = Field(..., description="google_calendar, gmail, google_drive")
    use_simulation: bool = True
    account_email: Optional[str] = "user@example.com"
