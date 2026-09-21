from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, model_validator
from app.schemas.agent_state import ApprovalRequest


class WorkflowCreate(BaseModel):
    goal_id: Optional[str] = None
    goal_prompt: Optional[str] = None
    title: Optional[str] = None


class StepResponse(BaseModel):
    id: str
    # DB columns
    step_key: Optional[str] = None
    agent_name: Optional[str] = None
    description: Optional[str] = None   # real DB column
    sequence: Optional[int] = 0          # real DB column
    status: Optional[str] = "pending"
    input_payload: Optional[Dict[str, Any]] = None  # real DB column
    output: Optional[Any] = None                    # real DB column
    created_at: Optional[datetime] = None
    # Schema-level aliases (computed from DB columns via validator)
    title: Optional[str] = None
    order: Optional[int] = 0
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    verification_status: Optional[str] = None
    verification_report: Optional[Dict[str, Any]] = None
    duration_ms: Optional[float] = 0.0

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def alias_db_fields(self) -> "StepResponse":
        """Map DB column names to legacy schema aliases."""
        if not self.title and self.description:
            self.title = self.description
        if not self.order and self.sequence:
            self.order = self.sequence
        if self.input_data is None and self.input_payload is not None:
            self.input_data = self.input_payload
        if self.output_data is None and isinstance(self.output, dict):
            self.output_data = self.output
        return self


class ApprovalDecision(BaseModel):
    approval_id: str
    decision: str = Field(..., description="'approved' or 'rejected'")
    comment: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    user_id: str
    goal_id: Optional[str] = None
    title: Optional[str] = None
    status: str = "pending"
    plan: Optional[Dict[str, Any]] = {}
    current_step_id: Optional[str] = None
    final_result: Optional[Any] = None
    total_tokens: Optional[int] = 0
    estimated_cost_usd: Optional[float] = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    steps: List[StepResponse] = []
    pending_approvals: Optional[List[ApprovalRequest]] = []
    state_snapshot: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}
