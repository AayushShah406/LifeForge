from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ToolResult(BaseModel):
    tool_name: str
    status: str = "success"  # success, error, requires_approval, permission_denied
    data: Any = None
    error: Optional[str] = None
    requires_approval: bool = False
    approval_payload: Optional[Dict[str, Any]] = None


class BaseTool(ABC):
    """Abstract base class for all LifeForge tools conforming to MCP standards."""

    name: str
    description: str
    parameters_schema: Dict[str, Any]
    is_sensitive: bool = False
    allowed_agents: List[str] = []

    @abstractmethod
    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        """Execute the tool with given parameters."""
        pass

    def to_mcp_definition(self) -> Dict[str, Any]:
        """Export tool as standard MCP tool definition."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.parameters_schema,
            "isSensitive": self.is_sensitive,
        }
