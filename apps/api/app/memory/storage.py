import logging
from typing import List, Optional
from app.models import embedding_model
from app.rag.weaviate_client import weaviate_client
from app.schemas.memory import MemoryItem
from app.memory.extraction import MemoryCandidate

logger = logging.getLogger("lifeforge.memory.storage")


class MemoryStorage:
    """Stores validated semantic memories into Weaviate Cloud vector collection."""

    def __init__(self):
        self.embedding = embedding_model()
        self.weaviate = weaviate_client

    async def store_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str = "preference",
        importance: float = 0.8,
        confidence: float = 0.9,
        source: str = "agent_run"
    ) -> MemoryItem:
        """Embed and store a single semantic memory item into Weaviate Cloud."""
        vector = await self.embedding.get_embedding(content)
        item = await self.weaviate.insert_memory(
            user_id=user_id,
            content=content,
            vector=vector,
            memory_type=memory_type,
            importance=importance,
            confidence=confidence,
            source=source
        )
        logger.info(f"Stored memory [{item.id}] for user {user_id} in Weaviate Cloud.")
        return item

    async def store_candidates(
        self,
        user_id: str,
        candidates: List[MemoryCandidate],
        source: str = "workflow_extraction"
    ) -> List[MemoryItem]:
        """Store multiple memory candidates."""
        stored = []
        for c in candidates:
            item = await self.store_memory(
                user_id=user_id,
                content=c.content,
                memory_type=c.memory_type,
                importance=c.importance,
                source=source
            )
            stored.append(item)
        return stored

    async def delete_memory(self, user_id: str, memory_id: str) -> bool:
        """Remove a memory item from Weaviate Cloud."""
        return await self.weaviate.delete_memory(user_id=user_id, memory_id=memory_id)


memory_storage = MemoryStorage()
