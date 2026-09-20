"""Semantic Memory Lifecycle Management (Sections 11-13, 94).

Manages:
1. Candidate extraction from conversations or workflow executions
2. Importance evaluation and deduplication
3. Embedding creation via Gemini Embedding model
4. Storage in Weaviate Cloud SemanticMemory collection
5. Contextual retrieval for agent workflows
"""
import logging
from typing import Any, Dict, List, Optional
from app.agents.memory import memory_agent
from app.vectorstore.service import vector_store_service

logger = logging.getLogger("lifeforge.memory.lifecycle")


class MemoryLifecycleManager:
    """End-to-end memory lifecycle manager for LifeForge users."""

    def __init__(self):
        self.agent = memory_agent
        self.vector_store = vector_store_service

    async def process_workflow_completion(
        self,
        user_id: str,
        goal: str,
        summary: str,
        workflow_id: str
    ) -> List[Dict[str, Any]]:
        """Extract and store durable context from a completed workflow."""
        text = f"Goal: {goal}\nOutcome: {summary}"
        return await self.agent.extract_and_store(
            user_id=user_id,
            text_content=text,
            source=f"workflow:{workflow_id}"
        )

    async def retrieve_memories_for_goal(
        self,
        user_id: str,
        goal: str,
        limit: int = 5
    ) -> List[str]:
        """Fetch task-relevant personal memories with user isolation."""
        return await self.agent.retrieve_relevant_memories(
            user_id=user_id,
            goal=goal,
            limit=limit
        )

    async def list_memories(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """List recent memories for user."""
        return await self.vector_store.search_memories(user_id=user_id, query="user preferences and context", limit=limit)

    async def delete_memory(self, memory_id: str, user_id: str) -> bool:
        """Delete specific memory from Weaviate."""
        return await self.vector_store.delete_memory(memory_id=memory_id, user_id=user_id)


memory_lifecycle = MemoryLifecycleManager()
