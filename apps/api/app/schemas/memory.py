from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class MemoryItem(BaseModel):
    id: str
    user_id: str
    content: str
    memory_type: str = "preference"  # preference, recurring_goal, fact, decision
    importance: float = Field(default=0.8, ge=0.0, le=1.0)
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    source: str = "agent_run"
    created_at: datetime


class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=5)
    memory_type: str = "preference"
    importance: float = 0.8


class MemorySearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    memory_type: Optional[str] = None
    top_k: int = 5
    min_importance: float = 0.5
