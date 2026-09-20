from typing import Any, Dict, List, Optional, TypedDict
from app.schemas.agent_state import (
    IntentAnalysis,
    Plan,
    PlanStep,
    VerificationResult,
    ApprovalRequest,
)


class LifeForgeWorkflowState(TypedDict):
    """Core Typed State Schema for LangGraph multi-agent execution."""
    workflow_id: str
    user_id: str
    goal: str
    intent: Optional[IntentAnalysis]
    plan: Optional[Plan]
    current_step: Optional[str]
    completed_steps: List[str]
    agent_outputs: Dict[str, Any]
    retrieved_context: Dict[str, Any]
    memory_context: List[str]
    tool_results: Dict[str, Any]
    pending_approvals: List[ApprovalRequest]
    verification_results: List[VerificationResult]
    errors: List[str]
    status: str  # pending, running, waiting_approval, completed, failed
    final_result: Optional[str]
