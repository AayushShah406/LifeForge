from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class EvaluationRunCreate(BaseModel):
    dataset_name: str = Field(..., description="interview_prep_v1, document_qa_v1, study_planner_v1")
    suite_type: str = Field(default="end_to_end", description="rag, agent, generation, end_to_end")


class EvaluationResultItem(BaseModel):
    test_case_id: str
    input_prompt: str
    score: float
    is_passed: str
    metric_details: Dict[str, Any]
    latency_ms: float
    tokens_used: int
    error_message: Optional[str] = None


class EvaluationRunResponse(BaseModel):
    id: str
    dataset_name: str
    suite_type: str
    status: str
    total_test_cases: int
    passed_test_cases: int
    avg_score: float
    avg_latency_ms: float
    total_tokens: int
    total_cost_usd: float
    summary_metrics: Dict[str, Any]
    created_at: datetime
    completed_at: Optional[datetime]
    results: List[EvaluationResultItem] = []

    class Config:
        from_attributes = True
