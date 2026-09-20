"""MCP Permission Matrix & Boundary Validation (Section 29).

Enforces least-privilege tool execution per agent role:
- ResearchAgent -> web_search
- DocumentAgent -> document_search
- MemoryAgent -> memory_search, memory_store
- EmailAgent -> gmail_search, gmail_read, gmail_draft, gmail_send (sensitive)
- CalendarAgent -> calendar_availability, calendar_create (sensitive), calendar_update, calendar_delete
- PlanningAgent -> task_create, task_update
"""
from typing import Dict, List, Set

AGENT_TOOL_PERMISSIONS: Dict[str, Set[str]] = {
    "research_agent": {"web_search"},
    "document_agent": {"document_search"},
    "memory_agent": {"memory_search", "memory_store"},
    "email_agent": {"gmail_search", "gmail_read", "gmail_draft", "gmail_send", "email_search", "email_draft", "email_send"},
    "calendar_agent": {"calendar_availability", "calendar_create", "calendar_update", "calendar_delete", "calendar_create_event"},
    "planning_agent": {"task_create", "task_update", "task_list"},
    "interview_agent": {"document_search", "memory_search"},
    "supervisor_agent": {"*"},  # Supervisor can dispatch to any agent
    "verification_agent": set(),  # Verification evaluates outputs, does not execute external tools
}

SENSITIVE_TOOLS: Set[str] = {
    "gmail_send",
    "email_send",
    "calendar_create",
    "calendar_create_event",
    "calendar_update",
    "calendar_delete",
}


def is_tool_allowed_for_agent(agent_name: str, tool_name: str) -> bool:
    """Check whether an agent has authorization to invoke a specific tool."""
    agent_key = agent_name.lower().replace("-", "_")
    allowed = AGENT_TOOL_PERMISSIONS.get(agent_key, set())
    if "*" in allowed:
        return True
    return tool_name.lower() in allowed


def requires_human_approval(tool_name: str) -> bool:
    """Returns True if the tool performs non-idempotent or external mutations."""
    return tool_name.lower() in SENSITIVE_TOOLS
