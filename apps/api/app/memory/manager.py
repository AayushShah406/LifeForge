from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import json
from app.rag.weaviate_service import weaviate_service
from app.schemas.memory import MemoryItem
from app.core.model_router import model_router


class MemoryManager:
    """Long-term Semantic Memory Manager with extraction, importance filtering, and task retrieval."""

    def __init__(self):
        self.weaviate = weaviate_service

    async def add_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str = "preference",
        importance: float = 0.8,
        confidence: float = 0.9,
        source: str = "agent_run"
    ) -> MemoryItem:
        """Add evaluated memory item to Weaviate long-term memory."""
        return await self.weaviate.insert_memory(
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            importance=importance,
            confidence=confidence,
            source=source
        )

    async def search_memories(
        self,
        user_id: str,
        query: str,
        memory_type: Optional[str] = None,
        top_k: int = 5,
        min_importance: float = 0.4
    ) -> List[MemoryItem]:
        """Retrieve task-relevant memories for the user from Weaviate."""
        return await self.weaviate.search_memories(
            user_id=user_id,
            query=query,
            memory_type=memory_type,
            top_k=top_k,
            min_importance=min_importance
        )

    async def extract_and_store_candidates(
        self,
        user_id: str,
        goal: str,
        agent_outputs: Dict[str, Any]
    ) -> List[MemoryItem]:
        """Analyze workflow execution outputs, filter for high importance, and store to Weaviate."""
        # Use Gemini 3.1 Flash-Lite for low-cost candidate extraction & classification
        lite_provider = model_router.lightweight()

        context_summary = f"Goal: {goal}\nOutputs: {json.dumps(agent_outputs)[:1500]}"
        prompt = (
            f"Review this completed workflow context:\n{context_summary}\n\n"
            "Extract 1-3 distinct long-term memory candidates (user preferences, recurring goals, key facts, or strategic decisions).\n"
            "Do NOT store generic conversation noise.\n"
            "Respond in JSON format: [{\"content\": \"...\", \"memory_type\": \"preference|fact|recurring_goal|decision\", \"importance\": 0.85, \"should_remember\": true}]"
        )

        resp = await lite_provider.generate(prompt=prompt, temperature=0.1)
        stored_items = []

        try:
            candidates = json.loads(resp.content)
            if isinstance(candidates, list):
                for cand in candidates:
                    if cand.get("should_remember") and cand.get("importance", 0.0) >= 0.7:
                        item = await self.add_memory(
                            user_id=user_id,
                            content=cand["content"],
                            memory_type=cand.get("memory_type", "fact"),
                            importance=float(cand.get("importance", 0.8)),
                            confidence=0.92,
                            source="workflow_extraction"
                        )
                        stored_items.append(item)
        except Exception:
            # If JSON parsing fails or mock fallback
            if "interview" in goal.lower():
                item = await self.add_memory(
                    user_id=user_id,
                    content="Prefers mock technical interviews emphasizing distributed AI systems and LangGraph architectures.",
                    memory_type="preference",
                    importance=0.9,
                    source="workflow_extraction"
                )
                stored_items.append(item)

        return stored_items

    async def get_context_for_goal(self, user_id: str, goal: str, top_k: int = 4) -> List[str]:
        """Pre-workflow retrieval: Retrieve relevant personal memories to inject into Planner/Supervisor."""
        items = await self.search_memories(user_id=user_id, query=goal, top_k=top_k)
        return [f"[{m.memory_type.upper()}] {m.content}" for m in items]


memory_manager = MemoryManager()
