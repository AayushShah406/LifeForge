from typing import Any, Dict, List, Optional
from app.tools.base import BaseTool, ToolResult


class MemorySearchTool(BaseTool):
    name = "memory_search"
    description = "Search user's long-term semantic memories stored in Weaviate (past preferences, recurring goals, past interview feedback, domain knowledge)."
    is_sensitive = False
    allowed_agents = ["supervisor", "planner", "interview", "planning"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Semantic query to retrieve past user memories"},
            "memory_type": {"type": "string", "description": "Optional filter: 'preference', 'fact', 'recurring_goal', 'decision'"},
            "top_k": {"type": "integer", "description": "Number of memories to retrieve", "default": 5}
        },
        "required": ["query"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        query = kwargs.get("query", "")
        memory_type = kwargs.get("memory_type")
        top_k = kwargs.get("top_k", 5)

        from app.memory.manager import memory_manager
        memories = await memory_manager.search_memories(
            user_id=user_id,
            query=query,
            memory_type=memory_type,
            top_k=top_k
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={
                "query": query,
                "memories": [m.model_dump() for m in memories],
                "count": len(memories)
            }
        )


class MemoryStoreTool(BaseTool):
    name = "memory_store"
    description = "Persist a new high-importance fact, user preference, or decision to long-term memory in Weaviate."
    is_sensitive = False
    allowed_agents = ["supervisor", "planner", "interview", "planning"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "content": {"type": "string", "description": "The precise memory statement to remember"},
            "memory_type": {"type": "string", "description": "preference, fact, decision, recurring_goal", "default": "preference"},
            "importance": {"type": "number", "description": "Importance score 0.0 to 1.0", "default": 0.8}
        },
        "required": ["content"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        content = kwargs.get("content", "")
        memory_type = kwargs.get("memory_type", "preference")
        importance = kwargs.get("importance", 0.8)

        from app.memory.manager import memory_manager
        item = await memory_manager.add_memory(
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            importance=importance,
            source="agent_tool"
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={"stored": True, "memory_id": item.id}
        )
