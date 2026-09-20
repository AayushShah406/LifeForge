"""Test that all 22 required PostgreSQL tables are defined and registered (Section 71-79)."""
import pytest
from app.database import Base

EXPECTED_22_TABLES = [
    "users",
    "user_profiles",
    "oauth_accounts",
    "sessions",
    "goals",
    "workflows",
    "workflow_steps",
    "tasks",
    "agent_runs",
    "agent_messages",
    "tool_calls",
    "approvals",
    "documents",
    "document_chunks",
    "integrations",
    "mcp_servers",
    "mcp_tools",
    "evaluation_runs",
    "evaluation_results",
    "usage_records",
    "model_invocations",
    "workflow_events",
]


def test_22_postgresql_tables_registered():
    """Verify that Base.metadata contains exactly the 22 required PostgreSQL tables."""
    registered_tables = list(Base.metadata.tables.keys())
    for expected in EXPECTED_22_TABLES:
        assert expected in registered_tables, f"Missing required table: '{expected}'"

    assert len(EXPECTED_22_TABLES) == 22
