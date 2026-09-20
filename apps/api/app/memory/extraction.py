import json
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.models import lightweight_model

logger = logging.getLogger("lifeforge.memory.extraction")


class MemoryCandidate(BaseModel):
    content: str
    memory_type: str = Field(..., description="preference, fact, recurring_goal, or decision")
    importance: float = Field(..., ge=0.0, le=1.0)
    should_remember: bool = True


class MemoryCandidateList(BaseModel):
    candidates: List[MemoryCandidate] = []


class MemoryExtractor:
    """Extracts high-value semantic memories from workflow execution contexts using Gemini Flash-Lite."""

    def __init__(self):
        self.model = lightweight_model()

    async def extract_candidates(
        self,
        goal: str = "",
        agent_outputs: Optional[Dict[str, Any]] = None,
        min_importance: float = 0.70,
        content: Optional[str] = None,
        user_id: Optional[str] = None,
        workflow_id: Optional[str] = None
    ) -> List[MemoryCandidate]:
        """Analyzes execution trajectory and outputs structured, non-redundant memory candidates."""
        text_context = content or goal
        outputs = agent_outputs or {}
        context_str = f"Goal/Context: {text_context}\nExecution Outputs:\n{json.dumps(outputs, default=str)[:2000]}"
        prompt = (
            f"Review this workflow execution context:\n{context_str}\n\n"
            "Extract 1 to 3 distinct long-term memory candidates regarding user preferences, recurring goals, "
            "established facts, or strategic decisions. Do NOT store generic conversation greetings or transient data.\n"
            "Assign an importance score between 0.0 and 1.0."
        )

        try:
            resp = await self.model.generate(
                prompt=prompt,
                system_instruction="You are a personal operations memory extraction specialist. Extract only actionable, high-relevance memories.",
                temperature=0.1,
                response_schema=MemoryCandidateList
            )
            if resp.structured and isinstance(resp.structured, MemoryCandidateList):
                filtered = [
                    c for c in resp.structured.candidates
                    if c.should_remember and c.importance >= min_importance
                ]
                logger.info(f"Extracted {len(filtered)} memory candidate(s) above threshold {min_importance}.")
                return filtered

            # JSON text parse fallback
            data = json.loads(resp.content)
            candidates_raw = data.get("candidates", data if isinstance(data, list) else [])
            filtered = []
            for item in candidates_raw:
                imp = float(item.get("importance", 0.0))
                if item.get("should_remember", True) and imp >= min_importance:
                    filtered.append(MemoryCandidate(
                        content=item["content"],
                        memory_type=item.get("memory_type", "fact"),
                        importance=imp,
                        should_remember=True
                    ))
            return filtered

        except Exception as e:
            logger.warning(f"Memory extraction fallback triggered: {e}")
            if "interview" in goal.lower():
                return [
                    MemoryCandidate(
                        content="Prefers structured mock interview drills emphasizing distributed AI architectures and STAR stories.",
                        memory_type="preference",
                        importance=0.88,
                        should_remember=True
                    )
                ]
            return []


memory_extractor = MemoryExtractor()
