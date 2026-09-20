import pytest
from app.tools.registry import tool_registry
from app.tools.guardrails import tool_guardrails


def test_tool_registry_has_core_tools():
    """Verify registry has registered core tools."""
    tools = tool_registry.list_tools()
    tool_names = [t.name for t in tools]

    assert "web_search" in tool_names
    assert "document_search" in tool_names
    assert "task_create" in tool_names
    assert "calendar_create_event" in tool_names
    assert "email_send" in tool_names


def test_sensitive_tools_require_approval():
    """Verify sensitive tools are marked as requiring human approval."""
    sensitive_tools = tool_registry.get_sensitive_tools()
    sensitive_names = [t.name for t in sensitive_tools]

    assert "calendar_create_event" in sensitive_names
    assert "email_send" in sensitive_names
    # Read-only tools should NOT require human approval
    assert "web_search" not in sensitive_names
    assert "document_search" not in sensitive_names


def test_agent_permission_guardrails():
    """Verify agents cannot invoke tools they lack permissions for."""
    # Planning agent is allowed to create tasks
    allowed = tool_guardrails.verify_agent_permission("planning", "task_create")
    assert allowed is True

    # Document agent should not be allowed to send emails
    unauthorized = tool_guardrails.verify_agent_permission("document", "email_send")
    assert unauthorized is False
