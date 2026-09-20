"""MCP Tools schema mapping and execution wrappers."""
from typing import Any, Dict, Optional
from app.mcp.registry import mcp_registry
from app.mcp.permissions import is_tool_allowed_for_agent, requires_human_approval


async def execute_mcp_tool(
    agent_name: str,
    tool_name: str,
    user_id: str,
    arguments: Dict[str, Any]
) -> Dict[str, Any]:
    """Execute an MCP tool with permission boundary verification and secret redaction."""
    result = await mcp_registry.execute_tool(
        agent_name=agent_name,
        tool_name=tool_name,
        user_id=user_id,
        parameters=arguments
    )
    return result.model_dump()
