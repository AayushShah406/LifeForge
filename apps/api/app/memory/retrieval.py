import logging
from typing import List, Optional
from app.models import embedding_model
from app.rag.weaviate_client import weaviate_client
from app.schemas.memory import MemoryItem

logger = logging.getLogger("lifeforge.memory.retrieval")


class MemoryRetriever:
    """Retrieves context-relevant semantic memories from Weaviate Cloud."""

    def __init__(self):
        self.embedding = embedding_model()
        self.weaviate = weaviate_client

    async def retrieve_memories(
        self,
        user_id: str,
        query: str,
        memory_type: Optional[str] = None,
        top_k: int = 5,
        min_importance: float = 0.4
    ) -> List[MemoryItem]:
        """Perform semantic search against Weaviate Cloud memories."""
        query_vector = await self.embedding.get_embedding(query)
        memories = await self.weaviate.search_memories(
            user_id=user_id,
            query_vector=query_vector,
            memory_type=memory_type,
            top_k=top_k,
            min_importance=min_importance
        )
        return memories

    async def get_memory_context_for_goal(
        self,
        user_id: str,
        goal: str,
        top_k: int = 4
    ) -> List[str]:
        """Synthesizes memory snippets to enrich initial agent planning prompts."""
        memories = await self.retrieve_memories(
            user_id=user_id,
            query=goal,
            top_k=top_k,
            min_importance=0.5
        )
        if not memories:
            return []

        return [
            f"User {m.memory_type.upper()}: {m.content} (importance: {m.importance})"
            for m in memories
        ]

    async def get_formatted_memory_context(
        self,
        user_id: str,
        query: str,
        top_k: int = 4
    ) -> str:
        """Convenience method returning memory strings for agent context."""
        snippets = await self.get_memory_context_for_goal(user_id=user_id, goal=query, top_k=top_k)
        return "\n".join(snippets) if snippets else "No prior memories found."

    async def retrieve(
        self,
        query: str,
        user_id: str,
        limit: int = 5,
        min_importance: float = 0.5
    ) -> List[dict]:
        """Convenience retrieval returning dictionaries."""
        mems = await self.retrieve_memories(user_id=user_id, query=query, top_k=limit, min_importance=min_importance)
        return [
            {"id": m.id, "content": m.content, "memory_type": m.memory_type, "importance": m.importance}
            if hasattr(m, "content") else m
            for m in mems
        ]


memory_retriever = MemoryRetriever()
