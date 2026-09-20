"""Dynamic supervisor routing for the LangGraph LifeForge state machine.

Supports all 10 specialized agents:
  research, document, interview, planning, calendar, email, memory,
  verification, planner, supervisor, final_synthesis.
"""
import logging
from typing import Literal
from app.agents.state import LifeForgeWorkflowState

logger = logging.getLogger("lifeforge.workflows.routing")

# All routable agent nodes
AGENT_ROUTE_MAP = {
    "research": "research_agent",
    "document": "document_agent",
    "interview": "interview_agent",
    "planning": "planning_agent",
    "calendar": "calendar_agent",
    "email": "email_agent",
    "memory": "memory_agent",
}

RouteTarget = Literal[
    "research_agent",
    "document_agent",
    "interview_agent",
    "planning_agent",
    "calendar_agent",
    "email_agent",
    "memory_agent",
    "final_synthesis",
]


def _resolve_agent_node(agent: str) -> str:
    """Convert an agent name string from the plan step to a graph node name."""
    agent_lower = agent.lower().strip()
    # Try exact mapping first
    if agent_lower in AGENT_ROUTE_MAP:
        return AGENT_ROUTE_MAP[agent_lower]
    # Try substring match
    for key, node in AGENT_ROUTE_MAP.items():
        if key in agent_lower:
            return node
    # Already fully qualified (e.g., "research_agent")
    if agent_lower.endswith("_agent"):
        return agent_lower
    return "final_synthesis"


def supervisor_route(state: LifeForgeWorkflowState) -> RouteTarget:
    """Conditional routing for the Supervisor node based on DAG plan state."""
    plan = state.get("plan")
    completed = state.get("completed_steps", [])

    steps = (getattr(plan, "steps", None) or (plan.get("steps", []) if isinstance(plan, dict) else [])) if plan else []
    if not steps:
        return "final_synthesis"

    # 1. Revision-flagged steps get highest priority (re-run their agent)
    for step in steps:
        s_status = getattr(step, "status", None) or (step.get("status") if isinstance(step, dict) else None)
        s_agent = getattr(step, "agent", None) or (step.get("agent") if isinstance(step, dict) else "planning")
        s_id = getattr(step, "id", None) or (step.get("id") if isinstance(step, dict) else "")
        if s_status == "needs_revision":
            node = _resolve_agent_node(s_agent)
            logger.info(f"[Supervisor] Routing to {node} for revision of step {s_id}")
            return node  # type: ignore[return-value]

    # 2. current_step set by supervisor node — route to that step's agent
    current_step_id = state.get("current_step")
    if current_step_id:
        for step in steps:
            s_id = getattr(step, "id", None) or (step.get("id") if isinstance(step, dict) else "")
            s_agent = getattr(step, "agent", None) or (step.get("agent") if isinstance(step, dict) else "planning")
            if s_id == current_step_id:
                node = _resolve_agent_node(s_agent)
                logger.info(f"[Supervisor] Routing to {node} for current step {s_id}")
                return node  # type: ignore[return-value]

    # 3. Next pending step whose dependencies are all satisfied
    for step in steps:
        s_status = getattr(step, "status", None) or (step.get("status") if isinstance(step, dict) else None)
        s_agent = getattr(step, "agent", None) or (step.get("agent") if isinstance(step, dict) else "planning")
        s_id = getattr(step, "id", None) or (step.get("id") if isinstance(step, dict) else "")
        s_deps = getattr(step, "dependencies", []) if hasattr(step, "dependencies") else (step.get("dependencies", []) if isinstance(step, dict) else [])
        if s_status in ("pending", "running", None):
            deps_met = all(d in completed for d in s_deps)
            if deps_met:
                node = _resolve_agent_node(s_agent)
                logger.info(f"[Supervisor] Routing to {node} for pending step {s_id}")
                return node  # type: ignore[return-value]

    # 4. All steps done or no next runnable step
    logger.info("[Supervisor] All steps completed or none runnable — routing to final_synthesis")
    return "final_synthesis"


def verification_route(state: LifeForgeWorkflowState) -> Literal[
    "approved_continue",
    "needs_approval",
    "needs_revision",
    "failed",
]:
    """Conditional routing from the Verification node."""
    pending_approvals = state.get("pending_approvals", [])
    if pending_approvals:
        return "needs_approval"

    verifications = state.get("verification_results", [])
    if not verifications:
        return "approved_continue"

    latest = verifications[-1]
    status = getattr(latest, "status", "approved").lower()

    if status == "approved":
        return "approved_continue"
    elif status == "needs_revision":
        return "needs_revision"
    elif status == "failed":
        return "failed"

    return "approved_continue"
