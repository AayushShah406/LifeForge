import logging
from typing import Any, Dict, List, Optional
from app.memory.storage import memory_storage
from app.memory.retrieval import memory_retriever
from app.rag.weaviate_client import weaviate_client

logger = logging.getLogger("lifeforge.services.memory")


class MemoryService:
    """Service managing semantic memory storage, retrieval, and lifecycle."""

    @staticmethod
    async def add_memory(
        user_id: str,
        content: str,
        memory_type: str = "fact",
        importance: float = 0.8,
        tags: Optional[List[str]] = None
    ) -> Optional[str]:
        """Stores a semantic memory item directly."""
        return await memory_storage.store_memory(
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            importance=importance,
            tags=tags or []
        )

    @staticmethod
    async def search_memories(
        user_id: str,
        query: str,
        limit: int = 5,
        min_importance: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Searches semantic memories with dense embedding vector similarity."""
        return await memory_retriever.retrieve(
            query=query,
            user_id=user_id,
            limit=limit,
            min_importance=min_importance
        )

    @staticmethod
    async def list_memories(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Lists active semantic memories for user."""
        try:
            results = await weaviate_client.retrieve_memories(
                user_id=user_id,
                query_vector=None,
                limit=limit,
                min_importance=0.0
            )
            return results
        except Exception as e:
            logger.error(f"Failed to list memories: {e}")
            return []

    @staticmethod
    async def delete_memory(memory_id: str) -> bool:
        """Deletes a semantic memory record."""
        return await memory_storage.delete_memory(memory_id)


memory_service = MemoryService()
