"""LangGraph Typed State Definitions (Section 26)."""
from typing import Any, Dict, List, Optional, TypedDict


class LifeForgeState(TypedDict, total=False):
    """Canonical LifeForge LangGraph state conforming to Section 26."""
    user_id: str
    goal_id: Optional[str]
    workflow_id: str
    goal: str
    plan: Dict[str, Any]
    current_agent: Optional[str]
    agent_outputs: Dict[str, Any]
    retrieved_context: List[Dict[str, Any]]
    memories: List[str]
    tool_results: List[Dict[str, Any]]
    approvals: List[Dict[str, Any]]
    verification_result: Optional[Dict[str, Any]]
    errors: List[str]
    status: str

    # Extended graph execution fields
    intent: Dict[str, Any]
    current_step: Optional[str]
    completed_steps: List[str]
    failed_steps: List[str]
    memory_context: List[str]
    pending_approvals: List[Dict[str, Any]]
    verification_results: Dict[str, Dict[str, Any]]
    final_result: Optional[Dict[str, Any]]
    iteration_count: int
    is_interrupted: bool


# Compatibility alias
WorkflowGraphState = LifeForgeState
