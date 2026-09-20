from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    estimated_duration_minutes: int = 30
    workflow_id: Optional[str] = None
    dependencies: List[str] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # pending, in_progress, completed, cancelled
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    user_id: str
    workflow_id: Optional[str]
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[datetime]
    estimated_duration_minutes: int
    dependencies: List[str]
    metadata_info: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
