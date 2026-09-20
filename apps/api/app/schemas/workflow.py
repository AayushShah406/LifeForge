from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.agent_state import Plan, ApprovalRequest, VerificationResult


class WorkflowCreate(BaseModel):
    goal_id: Optional[str] = None
    goal_prompt: Optional[str] = None
    title: Optional[str] = None


class StepResponse(BaseModel):
    id: str
    step_key: str
    agent_name: str
    title: str
    order: int
    status: str
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]]
    verification_status: Optional[str]
    verification_report: Optional[Dict[str, Any]]
    duration_ms: float
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    approval_id: str
    decision: str = Field(..., description="'approved' or 'rejected'")
    comment: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    user_id: str
    goal_id: Optional[str]
    title: str
    status: str
    plan: Dict[str, Any]
    current_step_id: Optional[str]
    final_result: Optional[Dict[str, Any]]
    total_tokens: int
    estimated_cost_usd: float
    created_at: datetime
    updated_at: datetime
    steps: List[StepResponse] = []
    pending_approvals: List[ApprovalRequest] = []

    class Config:
        from_attributes = True
