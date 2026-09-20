from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    status: str
    chunk_count: int
    summary: Optional[str]
    extracted_entities: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentChunkSchema(BaseModel):
    chunk_id: str
    document_id: str
    user_id: str
    content: str
    document_type: str
    source: str
    page_number: int = 1
    score: Optional[float] = None
    created_at: datetime


class DocumentSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    document_type: Optional[str] = None
    top_k: int = 5
    similarity_threshold: float = 0.65
