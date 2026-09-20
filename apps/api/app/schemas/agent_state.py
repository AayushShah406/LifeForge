from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator
from datetime import datetime


class DictAccessMixin:
    """Provides dictionary-style indexing and .get() for Pydantic models."""
    def get(self, key: str, default: Any = None) -> Any:
        return getattr(self, key, default)

    def __getitem__(self, key: str) -> Any:
        try:
            val = getattr(self, key)
            if key == "steps" and isinstance(val, list):
                return [s.model_dump() if hasattr(s, "model_dump") else s for s in val]
            return val
        except AttributeError:
            raise KeyError(key)

    def __contains__(self, key: str) -> bool:
        return hasattr(self, key)


class PlanStep(BaseModel, DictAccessMixin):
    id: str = Field(..., description="Unique step identifier e.g. step_1 or research_company")
    agent: str = Field(..., description="Target agent: research, document, interview, planning")
    title: Optional[str] = Field(None, description="Short step title")
    description: str = Field(..., description="Clear human-readable description of what to execute")
    dependencies: List[str] = Field(default_factory=list, description="Step IDs that must complete prior to this step")
    requires_approval: bool = Field(default=False, description="Whether this step requires human sign-off")
    status: str = Field(default="pending", description="pending, running, completed, needs_revision, failed")
    tool_hints: List[str] = Field(default_factory=list, description="Suggested tools to invoke")
    estimated_minutes: int = Field(default=30)


class Plan(BaseModel, DictAccessMixin):
    goal: str = Field(..., description="The user's high-level objective")
    workflow_type: str = Field(default="general", description="interview_prep, document_analysis, study_plan, general_ops")
    steps: List[PlanStep] = Field(..., description="Sequence and DAG dependencies of steps")
    estimated_duration_minutes: int = Field(default=30)
    requires_external_mutations: bool = Field(default=False)

    @model_validator(mode="before")
    @classmethod
    def reconcile_plan_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "goal_summary" in data and "goal" not in data:
                data["goal"] = data["goal_summary"]
            if "estimated_total_minutes" in data and "estimated_duration_minutes" not in data:
                data["estimated_duration_minutes"] = data["estimated_total_minutes"]
        return data


class IntentAnalysis(BaseModel, DictAccessMixin):
    intent: str = Field(default="general_task", description="Categorized user intent")
    primary_intent: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    category: str = Field(default="general")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted dates, companies, topics")
    extracted_entities: Optional[Dict[str, Any]] = None
    needs_clarification: bool = Field(default=False)
    requires_clarification: Optional[bool] = None
    clarification_question: Optional[str] = None
    clarification_prompt: Optional[str] = None
    suggested_agents: List[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def reconcile_intent_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Normalize intent / primary_intent
            p_intent = data.get("primary_intent") or data.get("intent") or "general_task"
            data["intent"] = p_intent
            data["primary_intent"] = p_intent

            # Category
            if "category" not in data:
                data["category"] = "interview" if "interview" in str(p_intent).lower() else "general"

            # Entities
            ents = data.get("entities") or data.get("extracted_entities") or {}
            data["entities"] = ents
            data["extracted_entities"] = ents

            # Clarification
            req_c = data.get("requires_clarification", data.get("needs_clarification", False))
            data["needs_clarification"] = bool(req_c)
            data["requires_clarification"] = bool(req_c)

            # Clarification question
            c_q = data.get("clarification_question") or data.get("clarification_prompt")
            data["clarification_question"] = c_q
            data["clarification_prompt"] = c_q

            # Suggested agents
            if not data.get("suggested_agents"):
                data["suggested_agents"] = ["document", "research", "interview", "planning"]
        return data


class VerificationResult(BaseModel, DictAccessMixin):
    status: str = Field(default="approved", description="approved, needs_revision, failed")
    passed: bool = Field(default=True)
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    dimension_scores: Dict[str, float] = Field(
        default_factory=lambda: {
            "relevance": 0.95,
            "factual_grounding": 0.94,
            "completeness": 0.92,
            "consistency": 0.96,
            "safety": 1.0,
            "actionability": 0.95,
            "format_compliance": 1.0,
        }
    )

    @model_validator(mode="before")
    @classmethod
    def reconcile_verif_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            st = data.get("status")
            if not st:
                passed = data.get("passed", True)
                data["status"] = "approved" if passed else "needs_revision"
            if "passed" not in data:
                data["passed"] = data.get("status") == "approved"
        return data

    @property
    def is_valid(self) -> bool:
        return self.passed or self.status == "approved"


class ApprovalRequest(BaseModel):
    id: str = Field(...)
    action_type: str = Field(..., description="calendar_create, email_send, delete_item, etc.")
    title: str = Field(...)
    description: str = Field(...)
    payload: Dict[str, Any] = Field(default_factory=dict)
    status: str = Field(default="pending")  # pending, approved, rejected
    created_at: Optional[datetime] = None


class LifeForgeState(BaseModel):
    """Typed LangGraph State Machine State conforming to Section 19."""
    user_id: str = Field(..., description="Current authenticated user ID")
    goal: str = Field(..., description="Original user prompt or objective")
    intent: Optional[IntentAnalysis] = None
    plan: Optional[Plan] = None
    current_step: Optional[str] = None
    completed_steps: List[str] = Field(default_factory=list)
    failed_steps: List[str] = Field(default_factory=list)
    agent_outputs: Dict[str, Any] = Field(default_factory=dict)
    retrieved_context: List[Dict[str, Any]] = Field(default_factory=list)
    memory_context: List[str] = Field(default_factory=list)
    tool_results: List[Dict[str, Any]] = Field(default_factory=list)
    pending_approvals: List[ApprovalRequest] = Field(default_factory=list)
    verification_results: Dict[str, VerificationResult] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    final_result: Optional[Dict[str, Any]] = None
    iteration_count: int = 0
    max_iterations: int = 25
