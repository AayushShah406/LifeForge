from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.database import User
from app.api.deps import get_current_user
from app.schemas.memory import MemoryCreate, MemorySearchRequest
from app.services.memory_service import memory_service

router = APIRouter(prefix="/memories", tags=["Memories"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_memory(
    payload: MemoryCreate,
    user: User = Depends(get_current_user)
):
    """Explicitly save a semantic memory or user preference."""
    mem_id = await memory_service.add_memory(
        user_id=user.id,
        content=payload.content,
        memory_type=payload.memory_type,
        importance=payload.importance
    )
    if not mem_id:
        raise HTTPException(status_code=500, detail="Failed to persist memory")
    return {"id": mem_id, "status": "stored", "content": payload.content}


@router.get("")
async def list_memories(
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """List semantic memories for current user."""
    return await memory_service.list_memories(user_id=user.id, limit=limit)


@router.post("/search")
async def search_memories(
    payload: MemorySearchRequest,
    user: User = Depends(get_current_user)
):
    """Retrieve semantic memories matching a natural language query."""
    results = await memory_service.search_memories(
        user_id=user.id,
        query=payload.query,
        limit=payload.top_k,
        min_importance=payload.min_importance
    )
    return {"query": payload.query, "results": results, "count": len(results)}


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a specific semantic memory."""
    deleted = await memory_service.delete_memory(memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found or deletion failed")
