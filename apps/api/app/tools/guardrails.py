import re
from typing import Any, Dict, List, Optional
from app.core.config import settings

INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"disregard all prior directives",
    r"you are now DAN",
    r"system prompt override",
    r"drop table ",
    r"delete from users",
    r"exec\(",
    r"eval\(",
    r"__import__",
]


class GuardrailViolation(Exception):
    pass


class GuardrailsManager:
    """Security and safety enforcement engine for AI workflows."""

    @staticmethod
    def detect_prompt_injection(text: str) -> Optional[str]:
        """Scans input text for known prompt injection / jailbreak patterns."""
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return f"Potential prompt injection pattern detected: '{pattern}'"
        return None

    @staticmethod
    def check_tool_permission(agent_name: str, tool_name: str, allowed_agents: List[str]) -> bool:
        """Enforces that an agent only has permission to call designated tools."""
        if "*" in allowed_agents or agent_name in allowed_agents:
            return True
        return False

    @staticmethod
    def verify_agent_permission(agent_name: str, tool_name: str) -> bool:
        """Convenience permission lookup against tool registry."""
        from app.tools.registry import tool_registry
        tool = tool_registry.get_tool(tool_name)
        if not tool:
            return False
        return GuardrailsManager.check_tool_permission(agent_name, tool_name, tool.allowed_agents)

    @staticmethod
    def is_action_sensitive(tool_name: str, is_mutation: bool = False) -> bool:
        """Determines if an action requires explicit human-in-the-loop approval."""
        sensitive_tools = {
            "send_email",
            "email_send",
            "create_calendar_event",
            "calendar_create_event",
            "update_calendar_event",
            "delete_calendar_event",
            "delete_document",
            "delete_memory",
            "external_api_mutation"
        }
        return tool_name in sensitive_tools or is_mutation


guardrails_manager = GuardrailsManager()
tool_guardrails = guardrails_manager

__all__ = [
    "GuardrailsManager",
    "GuardrailViolation",
    "guardrails_manager",
    "tool_guardrails",
    "INJECTION_PATTERNS"
]
