"""Memory Agent (Sections 11-13, 19, 94).

Extracts durable semantic memories (preferences, goals, projects, skills, constraints),
evaluates importance and confidence, and retrieves task-relevant memories from Weaviate.
"""
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.llm.router import get_lightweight_model, get_fast_model
from app.vectorstore.service import vector_store_service

logger = logging.getLogger("lifeforge.agents.memory")


class MemoryCandidate(BaseModel):
    content: str = Field(description="Durable factual memory statement")
    memory_type: str = Field(
        default="preference",
        description="Type: Preference, Goal, Project, Skill, Context, Fact, Constraint, Experience"
    )
    importance: float = Field(default=0.8, description="Importance score between 0.0 and 1.0")
    confidence: float = Field(default=0.9, description="Confidence score between 0.0 and 1.0")


class MemoryExtractionResult(BaseModel):
    candidates: List[MemoryCandidate] = Field(default_factory=list)
    summary: str = Field(default="Memory extraction complete")


class MemoryAgent:
    """Agent responsible for semantic long-term memory extraction and contextual recall."""

    def __init__(self):
        self.light_llm = get_lightweight_model()
        self.fast_llm = get_fast_model()
        self.vector_store = vector_store_service

    async def extract_and_store(
        self,
        user_id: str,
        text_content: str,
        source: str = "workflow"
    ) -> List[Dict[str, Any]]:
        """Extract durable memories from text and persist into Weaviate SemanticMemory."""
        prompt = f"""Analyze the following user input/conversation and extract ONLY durable, useful long-term memories.
Do not store transient requests, small talk, or temporary queries.
Only extract durable preferences, engineering skills, project context, long-term goals, and constraints.

Input:
\"\"\"{text_content}\"\"\"

Return a structured list of memory candidates with type, importance (0.1 - 1.0), and confidence.
"""
        response = await self.light_llm.generate(
            prompt=prompt,
            system_instruction="You are an expert AI memory extractor. Only extract persistent, high-value user context.",
            response_schema=MemoryExtractionResult
        )

        persisted = []
        candidates_found = False
        if response.structured and isinstance(response.structured, MemoryExtractionResult) and response.structured.candidates:
            for cand in response.structured.candidates:
                if cand.importance >= 0.5:
                    item = await self.vector_store.insert_memory(
                        user_id=user_id,
                        content=cand.content,
                        memory_type=cand.memory_type,
                        importance=cand.importance,
                        confidence=cand.confidence,
                        source=source
                    )
                    persisted.append(item)
                    candidates_found = True
                    logger.info(f"Persisted memory for user {user_id}: {cand.content[:50]}...")

        if not candidates_found:
            # Fallback candidate
            item = await self.vector_store.insert_memory(
                user_id=user_id,
                content=text_content.strip(),
                memory_type="Preference",
                importance=0.85,
                confidence=0.9,
                source=source
            )
            persisted.append(item)

        return persisted

    async def retrieve_relevant_memories(
        self,
        user_id: str,
        goal: str,
        limit: int = 5
    ) -> List[str]:
        """Retrieve memories relevant to the current user goal."""
        memories = await self.vector_store.search_memories(
            user_id=user_id,
            query=goal,
            limit=limit
        )
        return [m.get("content", "") for m in memories if m.get("content")]

    async def extract_and_store_memories(
        self,
        user_id: str,
        goal: str,
        agent_outputs: Dict[str, Any]
    ) -> MemoryExtractionResult:
        """High-level method: extract memories from the goal + all agent outputs, persist, and return result."""
        # Build a consolidated text for memory extraction
        parts = [f"Goal: {goal}"]
        for step_id, output in agent_outputs.items():
            if isinstance(output, dict):
                summary = output.get("summary") or output.get("memory_summary") or str(output)[:200]
                parts.append(f"Step {step_id}: {summary}")

        combined_text = "\n".join(parts)

        prompt = f"""Analyze the following completed workflow session and extract ONLY durable, high-value long-term memories.
Focus on: user preferences, discovered skills, goals, constraints, project context.
Do NOT store transient task details or intermediate steps.

Session context:
\"\"\"{combined_text}\"\"\"

Return structured MemoryExtractionResult with candidates list and a summary sentence."""

        response = await self.light_llm.generate(
            prompt=prompt,
            system_instruction="You are an expert AI memory curator. Extract only persistent, valuable user context.",
            response_schema=MemoryExtractionResult
        )

        result = None
        if response.structured and isinstance(response.structured, MemoryExtractionResult):
            result = response.structured
        else:
            result = MemoryExtractionResult(
                candidates=[MemoryCandidate(
                    content=f"User completed goal: {goal[:100]}",
                    memory_type="Goal",
                    importance=0.75,
                    confidence=0.9
                )],
                summary=f"Workflow completed for: {goal[:80]}"
            )

        # Persist all candidates above threshold
        for cand in result.candidates:
            if cand.importance >= 0.5:
                try:
                    await self.vector_store.insert_memory(
                        user_id=user_id,
                        content=cand.content,
                        memory_type=cand.memory_type,
                        importance=cand.importance,
                        confidence=cand.confidence,
                        source="workflow_completion"
                    )
                except Exception as e:
                    logger.warning(f"Memory persistence error: {e}")

        return result


memory_agent = MemoryAgent()
