from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    raw_prompt: str = Field(..., min_length=3, description="Natural language goal input")
    category: Optional[str] = "general"
    target_date: Optional[datetime] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    raw_prompt: str
    title: str
    status: str
    category: str
    intent_data: Dict[str, Any]
    target_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
