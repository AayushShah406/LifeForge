"""LifeForge Relational Database Models (SQLAlchemy 2.x).

Defines the exact 22 PostgreSQL tables specified in Section 71-79:
1.  users
2.  user_profiles
3.  oauth_accounts
4.  sessions
5.  goals
6.  workflows
7.  workflow_steps
8.  tasks
9.  agent_runs
10. agent_messages
11. tool_calls
12. approvals
13. documents
14. document_chunks
15. integrations
16. mcp_servers
17. mcp_tools
18. evaluation_runs
19. evaluation_results
20. usage_records
21. model_invocations
22. workflow_events
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.database.session import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ==============================================================================
# 1. users
# ==============================================================================
class User(Base):
    """Core user account table with authentication and role."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # USER, ADMIN, DEVELOPER
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Backward-compatible fields
    full_name = Column(String(255), nullable=True)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    workflows = relationship("Workflow", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    integrations = relationship("Integration", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    approvals = relationship("Approval", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    evaluation_runs = relationship("EvaluationRun", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    usage_records = relationship("UsageRecord", back_populates="user", cascade="all, delete-orphan", lazy="selectin")

    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value: str):
        self.password_hash = value

    def __init__(self, **kwargs):
        if "hashed_password" in kwargs and "password_hash" not in kwargs:
            kwargs["password_hash"] = kwargs.pop("hashed_password")
        super().__init__(**kwargs)


# ==============================================================================
# 2. user_profiles
# ==============================================================================
class UserProfile(Base):
    """Extended profile information for user."""
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=True)
    avatar_url = Column(String(1024), nullable=True)
    timezone = Column(String(100), default="UTC", nullable=False)
    preferences = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    user = relationship("User", back_populates="profile", lazy="selectin")


# ==============================================================================
# 3. oauth_accounts
# ==============================================================================
class OAuthAccount(Base):
    """OAuth provider credentials (encrypted at rest)."""
    __tablename__ = "oauth_accounts"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    provider = Column(String(50), index=True, nullable=False)  # google, github, etc.
    provider_user_id = Column(String(255), nullable=False)
    access_token_encrypted = Column(Text, nullable=True)
    refresh_token_encrypted = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    user = relationship("User", back_populates="oauth_accounts", lazy="selectin")

    __table_args__ = (
        Index("ix_oauth_accounts_user_provider", "user_id", "provider"),
    )


# ==============================================================================
# 4. sessions
# ==============================================================================
class Session(Base):
    """Authenticated user refresh sessions."""
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sessions", lazy="selectin")


# ==============================================================================
# 5. goals
# ==============================================================================
class Goal(Base):
    """User high-level operational goals and intents."""
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending", index=True, nullable=False)  # pending, in_progress, completed, failed
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Preserved backward-compatible fields
    raw_prompt = Column(Text, nullable=True)
    intent_data = Column(JSON, default=dict, nullable=False)
    category = Column(String(100), default="general", nullable=False)

    user = relationship("User", back_populates="goals", lazy="selectin")
    workflows = relationship("Workflow", back_populates="goal", cascade="all, delete-orphan", lazy="selectin")

    @property
    def target_date(self):
        return self.deadline

    @target_date.setter
    def target_date(self, value):
        self.deadline = value

    def __init__(self, **kwargs):
        if "raw_prompt" in kwargs and "description" not in kwargs:
            kwargs["description"] = kwargs["raw_prompt"]
        if "raw_prompt" in kwargs and "title" not in kwargs:
            kwargs["title"] = kwargs["raw_prompt"][:100]
        if "target_date" in kwargs:
            t_date = kwargs.pop("target_date")
            if "deadline" not in kwargs or kwargs.get("deadline") is None:
                kwargs["deadline"] = t_date
        super().__init__(**kwargs)


# ==============================================================================
# 6. workflows
# ==============================================================================
class Workflow(Base):
    """LangGraph stateful workflow execution."""
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), index=True, nullable=True)
    workflow_type = Column(String(100), default="agentic_orchestration", nullable=False)
    status = Column(String(50), default="pending", index=True, nullable=False)  # pending, running, paused, waiting_approval, completed, failed, cancelled
    current_node = Column(String(100), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Extended telemetry and snapshot
    title = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    plan = Column(JSON, default=dict, nullable=True)
    plan_spec = Column(JSON, default=dict, nullable=True)
    final_result = Column(JSON, nullable=True)
    state_snapshot = Column(JSON, nullable=True)
    total_tokens = Column(Integer, default=0, nullable=False)
    estimated_cost_usd = Column(Float, default=0.0, nullable=False)
    current_step_id = Column(String(36), nullable=True)

    user = relationship("User", back_populates="workflows", lazy="selectin")
    goal = relationship("Goal", back_populates="workflows", lazy="selectin")
    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    agent_runs = relationship("AgentRun", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    tool_calls = relationship("ToolCall", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    approvals = relationship("Approval", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    tasks = relationship("Task", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    events = relationship("WorkflowEvent", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    usage_records = relationship("UsageRecord", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")
    model_invocations = relationship("ModelInvocation", back_populates="workflow", cascade="all, delete-orphan", lazy="selectin")

    def __init__(self, **kwargs):
        if "title" in kwargs and "name" not in kwargs:
            kwargs["name"] = kwargs["title"]
        elif "name" in kwargs and "title" not in kwargs:
            kwargs["title"] = kwargs["name"]
        if "plan" in kwargs and "plan_spec" not in kwargs:
            kwargs["plan_spec"] = kwargs["plan"]
        elif "plan_spec" in kwargs and "plan" not in kwargs:
            kwargs["plan"] = kwargs["plan_spec"]
        super().__init__(**kwargs)


# ==============================================================================
# 7. workflow_steps
# ==============================================================================
class WorkflowStep(Base):
    """Step execution node within a workflow DAG."""
    __tablename__ = "workflow_steps"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=False)
    step_key = Column(String(100), nullable=True)
    agent_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed, skipped
    sequence = Column(Integer, default=0, nullable=False)
    dependencies = Column(JSON, default=list, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    output = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Legacy fields
    name = Column(String(255), nullable=True)
    step_type = Column(String(100), default="execution", nullable=False)
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    execution_order = Column(Integer, default=0, nullable=False)

    workflow = relationship("Workflow", back_populates="steps", lazy="selectin")

    def __init__(self, **kwargs):
        if "title" in kwargs:
            t = kwargs.pop("title")
            if "description" not in kwargs or not kwargs.get("description"):
                kwargs["description"] = t
        if "order" in kwargs:
            o = kwargs.pop("order")
            if "sequence" not in kwargs:
                kwargs["sequence"] = o
        if "input_data" in kwargs:
            inp = kwargs.pop("input_data")
            if "input_payload" not in kwargs:
                kwargs["input_payload"] = inp
        if "output_data" in kwargs:
            outp = kwargs.pop("output_data")
            if "output" not in kwargs:
                kwargs["output"] = outp
        if "verification_status" in kwargs:
            kwargs.pop("verification_status")
        if "name" in kwargs and "step_key" not in kwargs:
            kwargs["step_key"] = kwargs["name"]
        elif "step_key" in kwargs and "name" not in kwargs:
            kwargs["name"] = kwargs["step_key"]
        if "execution_order" in kwargs and "sequence" not in kwargs:
            kwargs["sequence"] = kwargs["execution_order"]
        super().__init__(**kwargs)


# ==============================================================================
# 8. tasks
# ==============================================================================
class Task(Base):
    """Actionable tasks generated by workflows or users."""
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="SET NULL"), index=True, nullable=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo", index=True, nullable=False)  # todo, in_progress, completed, cancelled
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    due_at = Column(DateTime(timezone=True), nullable=True)
    source = Column(String(100), default="agent", nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Calendar integration fields
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    calendar_event_id = Column(String(255), nullable=True)

    user = relationship("User", back_populates="tasks", lazy="selectin")
    workflow = relationship("Workflow", back_populates="tasks", lazy="selectin")

    @property
    def due_date(self) -> Optional[datetime]:
        return self.due_at

    @due_date.setter
    def due_date(self, value: Optional[datetime]):
        self.due_at = value


# ==============================================================================
# 9. agent_runs
# ==============================================================================
class AgentRun(Base):
    """Execution log for individual specialized agents."""
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=False)
    agent_name = Column(String(100), index=True, nullable=False)
    model = Column(String(100), nullable=False)
    status = Column(String(50), default="running", nullable=False)
    input = Column(Text, nullable=True)
    output = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    latency_ms = Column(Float, default=0.0, nullable=False)
    error = Column(Text, nullable=True)

    # Additional metrics & trace
    step_id = Column(String(36), nullable=True)
    prompt_tokens = Column(Integer, default=0, nullable=False)
    completion_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    cost_usd = Column(Float, default=0.0, nullable=False)
    langsmith_trace_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="agent_runs", lazy="selectin")
    messages = relationship("AgentMessage", back_populates="agent_run", cascade="all, delete-orphan", lazy="selectin")
    tool_calls = relationship("ToolCall", back_populates="agent_run", cascade="all, delete-orphan", lazy="selectin")
    model_invocations = relationship("ModelInvocation", back_populates="agent_run", cascade="all, delete-orphan", lazy="selectin")

    @property
    def model_name(self) -> str:
        return self.model

    @model_name.setter
    def model_name(self, value: str):
        self.model = value

    def __init__(self, **kwargs):
        if "model_name" in kwargs and "model" not in kwargs:
            kwargs["model"] = kwargs.pop("model_name")
        if "input_prompt" in kwargs and "input" not in kwargs:
            kwargs["input"] = kwargs.pop("input_prompt")
        if "output_response" in kwargs and "output" not in kwargs:
            kwargs["output"] = kwargs.pop("output_response")
        super().__init__(**kwargs)


# ==============================================================================
# 10. agent_messages
# ==============================================================================
class AgentMessage(Base):
    """Fine-grained messages exchanged during agent execution."""
    __tablename__ = "agent_messages"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(50), nullable=False)  # system, user, assistant, tool, verifier
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="text", nullable=False)  # text, structured, tool_call, error
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    agent_run = relationship("AgentRun", back_populates="messages", lazy="selectin")


# ==============================================================================
# 11. tool_calls
# ==============================================================================
class ToolCall(Base):
    """Audit record for every MCP and native tool execution with secret redaction."""
    __tablename__ = "tool_calls"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=False)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), index=True, nullable=False)
    tool_name = Column(String(100), nullable=False)
    input = Column(JSON, nullable=True)
    output = Column(JSON, nullable=True)
    status = Column(String(50), default="completed", nullable=False)  # running, completed, failed, paused
    latency_ms = Column(Float, default=0.0, nullable=False)
    approval_id = Column(String(36), nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="tool_calls", lazy="selectin")
    agent_run = relationship("AgentRun", back_populates="tool_calls", lazy="selectin")

    def __init__(self, **kwargs):
        if "arguments" in kwargs and "input" not in kwargs:
            kwargs["input"] = kwargs.pop("arguments")
        if "result" in kwargs and "output" not in kwargs:
            kwargs["output"] = kwargs.pop("result")
        super().__init__(**kwargs)


# ==============================================================================
# 12. approvals
# ==============================================================================
class Approval(Base):
    """Human-in-the-Loop review gates that pause and resume LangGraph."""
    __tablename__ = "approvals"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=False)
    tool_call_id = Column(String(36), nullable=True)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String(50), default="pending", index=True, nullable=False)  # pending, approved, rejected, expired
    requested_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Legacy fields
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    user = relationship("User", back_populates="approvals", lazy="selectin")
    workflow = relationship("Workflow", back_populates="approvals", lazy="selectin")

    def __init__(self, **kwargs):
        if "action_name" in kwargs and "action_type" not in kwargs:
            kwargs["action_type"] = kwargs.pop("action_name")
        if "action_payload" in kwargs and "payload" not in kwargs:
            kwargs["payload"] = kwargs.pop("action_payload")
        super().__init__(**kwargs)


# ==============================================================================
# 13. documents
# ==============================================================================
class Document(Base):
    """Metadata for uploaded documents (PDF, DOCX, TXT, Markdown)."""
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, md
    mime_type = Column(String(100), default="application/octet-stream", nullable=False)
    storage_path = Column(String(1024), nullable=True)
    file_size = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="uploaded", index=True, nullable=False)  # uploaded, processing, indexed, failed, deleted
    page_count = Column(Integer, default=0, nullable=False)
    checksum = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Extended RAG summary fields
    summary = Column(Text, nullable=True)
    extracted_entities = Column(JSON, default=dict, nullable=False)
    chunk_count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="documents", lazy="selectin")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", lazy="selectin")

    def __init__(self, **kwargs):
        if "file_size_bytes" in kwargs and "file_size" not in kwargs:
            kwargs["file_size"] = kwargs.pop("file_size_bytes")
        if "file_path" in kwargs and "storage_path" not in kwargs:
            kwargs["storage_path"] = kwargs.pop("file_path")
        super().__init__(**kwargs)


# ==============================================================================
# 14. document_chunks
# ==============================================================================
class DocumentChunk(Base):
    """Metadata mapping chunk records to vectors stored in Weaviate Cloud."""
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    chunk_id = Column(String(100), nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    section = Column(String(255), nullable=True)
    content_hash = Column(String(64), nullable=True)
    weaviate_object_id = Column(String(100), index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    document = relationship("Document", back_populates="chunks", lazy="selectin")

    __table_args__ = (
        Index("ix_document_chunks_user_doc", "user_id", "document_id"),
    )


# ==============================================================================
# 15. integrations
# ==============================================================================
class Integration(Base):
    """External service connection state and encrypted credentials."""
    __tablename__ = "integrations"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    provider = Column(String(50), index=True, nullable=False)  # gmail, google_calendar, google_drive, slack
    status = Column(String(50), default="connected", nullable=False)
    encrypted_credentials = Column(Text, nullable=True)
    scopes = Column(JSON, default=list, nullable=False)
    connected_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    # Legacy fields
    is_connected = Column(Boolean, default=True, nullable=False)
    is_sandbox_simulated = Column(Boolean, default=False, nullable=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    metadata_info = Column(JSON, default=dict, nullable=False)

    user = relationship("User", back_populates="integrations", lazy="selectin")


# ==============================================================================
# 16. mcp_servers
# ==============================================================================
class MCPServer(Base):
    """Registered Model Context Protocol (MCP) tool servers."""
    __tablename__ = "mcp_servers"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    server_url = Column(String(1024), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # active, disabled, unreachable
    configuration = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    tools = relationship("MCPTool", back_populates="server", cascade="all, delete-orphan", lazy="selectin")


# ==============================================================================
# 17. mcp_tools
# ==============================================================================
class MCPTool(Base):
    """Individual tools exposed by MCP servers with granular permission tiers."""
    __tablename__ = "mcp_tools"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    mcp_server_id = Column(String(36), ForeignKey("mcp_servers.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=True)
    input_schema = Column(JSON, default=dict, nullable=False)
    output_schema = Column(JSON, default=dict, nullable=False)
    permission_level = Column(String(50), default="safe", nullable=False)  # safe, sensitive, restricted
    is_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False)

    server = relationship("MCPServer", back_populates="tools", lazy="selectin")


# ==============================================================================
# 18. evaluation_runs
# ==============================================================================
class EvaluationRun(Base):
    """Batch and continuous agent benchmark evaluations."""
    __tablename__ = "evaluation_runs"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
    dataset_name = Column(String(255), index=True, nullable=False)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="SET NULL"), index=True, nullable=True)
    status = Column(String(50), default="running", nullable=False)  # running, completed, failed
    started_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    # Aggregated metrics
    suite_type = Column(String(100), default="end_to_end", nullable=False)
    total_test_cases = Column(Integer, default=0, nullable=False)
    passed_test_cases = Column(Integer, default=0, nullable=False)
    avg_score = Column(Float, default=0.0, nullable=False)
    avg_latency_ms = Column(Float, default=0.0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    total_cost_usd = Column(Float, default=0.0, nullable=False)
    summary_metrics = Column(JSON, default=dict, nullable=False)

    user = relationship("User", back_populates="evaluation_runs", lazy="selectin")
    results = relationship("EvaluationResult", back_populates="run", cascade="all, delete-orphan", lazy="selectin")


# ==============================================================================
# 19. evaluation_results
# ==============================================================================
class EvaluationResult(Base):
    """Metric-level evaluation scores per test case."""
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    evaluation_run_id = Column(String(36), ForeignKey("evaluation_runs.id", ondelete="CASCADE"), index=True, nullable=False)
    metric_name = Column(String(100), index=True, nullable=False)  # task_completion, rag_relevance, faithfulness, etc.
    score = Column(Float, default=0.0, nullable=False)
    expected = Column(Text, nullable=True)
    actual = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    # Legacy fields
    test_case_id = Column(String(100), nullable=True)
    prompt = Column(Text, nullable=True)
    actual_output = Column(Text, nullable=True)
    passed = Column(Boolean, default=False, nullable=False)
    latency_ms = Column(Float, default=0.0, nullable=False)
    tokens_used = Column(Integer, default=0, nullable=False)
    cost_usd = Column(Float, default=0.0, nullable=False)
    details = Column(JSON, default=dict, nullable=False)

    run = relationship("EvaluationRun", back_populates="results", lazy="selectin")


# ==============================================================================
# 20. usage_records
# ==============================================================================
class UsageRecord(Base):
    """Aggregated token and cost accounting records."""
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=True)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="SET NULL"), index=True, nullable=True)
    model = Column(String(100), nullable=False)
    input_tokens = Column(Integer, default=0, nullable=False)
    output_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    user = relationship("User", back_populates="usage_records", lazy="selectin")
    workflow = relationship("Workflow", back_populates="usage_records", lazy="selectin")


# ==============================================================================
# 21. model_invocations
# ==============================================================================
class ModelInvocation(Base):
    """Granular per-call LLM telemetry, latency, purpose, and token metrics."""
    __tablename__ = "model_invocations"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=True)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="SET NULL"), index=True, nullable=True)
    model = Column(String(100), nullable=False)
    provider = Column(String(50), default="gemini", nullable=False)
    purpose = Column(String(100), nullable=False)  # supervisor_planning, interview_questions, verification, etc.
    input_tokens = Column(Integer, default=0, nullable=False)
    output_tokens = Column(Integer, default=0, nullable=False)
    latency_ms = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="success", nullable=False)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="model_invocations", lazy="selectin")
    agent_run = relationship("AgentRun", back_populates="model_invocations", lazy="selectin")


# ==============================================================================
# 22. workflow_events
# ==============================================================================
class WorkflowEvent(Base):
    """Sequential observability and SSE replay events for agent workflows."""
    __tablename__ = "workflow_events"

    id = Column(String(36), primary_key=True, default=_generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id", ondelete="CASCADE"), index=True, nullable=False)
    event_type = Column(String(100), nullable=False)  # workflow_started, tool_started, etc.
    agent_name = Column(String(100), nullable=True)
    payload = Column(JSON, default=dict, nullable=False)
    sequence = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utc_now, nullable=False)

    workflow = relationship("Workflow", back_populates="events", lazy="selectin")

    __table_args__ = (
        Index("ix_workflow_events_wf_seq", "workflow_id", "sequence"),
    )
