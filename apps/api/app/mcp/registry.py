"""MCP Registry and Tool Discovery (Section 28)."""
from typing import Any, Dict, List, Optional
from app.tools.registry import ToolRegistry
from app.mcp.permissions import is_tool_allowed_for_agent, requires_human_approval

# Create MCP Tool Registry wrapping default tools
mcp_registry = ToolRegistry()


def list_mcp_tools() -> List[Dict[str, Any]]:
    """Return all registered MCP tools formatted as JSON Schemas."""
    tools = []
    for t in mcp_registry.list_tools():
        definition = t.to_mcp_definition() if hasattr(t, "to_mcp_definition") else {
            "name": t.name,
            "description": t.description,
            "parameters": t.parameters_schema if hasattr(t, "parameters_schema") else {}
        }
        definition["requires_approval"] = requires_human_approval(t.name)
        tools.append(definition)
    return tools
