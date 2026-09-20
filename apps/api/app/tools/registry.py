import time
from typing import Any, Dict, List, Optional
from app.tools.base import BaseTool, ToolResult
from app.tools.guardrails import GuardrailsManager, GuardrailViolation
from app.tools.web_search import WebSearchTool
from app.tools.document_tools import DocumentSearchTool
from app.tools.memory_tools import MemorySearchTool, MemoryStoreTool
from app.tools.calendar_tools import CalendarAvailabilityTool, CalendarCreateEventTool
from app.tools.email_tools import EmailSearchTool, EmailDraftTool, EmailSendTool
from app.tools.task_tools import TaskCreateTool, TaskListTool


class ToolRegistry:
    """Centralized Tool Registry for discovery, permissions, and execution."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        tools = [
            WebSearchTool(),
            DocumentSearchTool(),
            MemorySearchTool(),
            MemoryStoreTool(),
            CalendarAvailabilityTool(),
            CalendarCreateEventTool(),
            EmailSearchTool(),
            EmailDraftTool(),
            EmailSendTool(),
            TaskCreateTool(),
            TaskListTool(),
        ]
        for t in tools:
            self.register(t)

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

    def get_sensitive_tools(self) -> List[BaseTool]:
        return [t for t in self._tools.values() if getattr(t, "is_sensitive", False)]

    def list_tools_for_agent(self, agent_name: str) -> List[Dict[str, Any]]:
        """Returns MCP tool definitions allowed for a specific agent role."""
        allowed = []
        for tool in self._tools.values():
            if GuardrailsManager.check_tool_permission(agent_name, tool.name, tool.allowed_agents):
                allowed.append(tool.to_mcp_definition())
        return allowed

    async def execute_tool(
        self,
        agent_name: str,
        tool_name: str,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> ToolResult:
        """Executes a tool with permission checks, injection screening, and timing."""
        tool = self.get_tool(tool_name)
        if not tool:
            return ToolResult(
                tool_name=tool_name,
                status="error",
                error=f"Tool '{tool_name}' not found in registry."
            )

        # 1. Permission check
        if not GuardrailsManager.check_tool_permission(agent_name, tool_name, tool.allowed_agents):
            return ToolResult(
                tool_name=tool_name,
                status="permission_denied",
                error=f"Agent '{agent_name}' is not permitted to execute tool '{tool_name}'."
            )

        # 2. Injection screening on string parameters
        for key, val in parameters.items():
            if isinstance(val, str):
                violation = GuardrailsManager.detect_prompt_injection(val)
                if violation:
                    return ToolResult(
                        tool_name=tool_name,
                        status="error",
                        error=f"Guardrail security violation: {violation}"
                    )

        # 3. Execution
        start_time = time.perf_counter()
        try:
            result = await tool.execute(user_id=user_id, **parameters)
            return result
        except Exception as e:
            return ToolResult(
                tool_name=tool_name,
                status="error",
                error=f"Execution error in tool '{tool_name}': {str(e)}"
            )


tool_registry = ToolRegistry()
