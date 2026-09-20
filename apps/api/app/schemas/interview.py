from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class InterviewQuestion(BaseModel):
    id: str = Field(default="q_1")
    category: str = Field(default="System Design")
    question: str = Field(...)
    context: Optional[str] = None
    ideal_answer_points: List[str] = Field(default_factory=list)
    difficulty: str = Field(default="medium")
    follow_up: Optional[str] = None


class StudyItem(BaseModel):
    day: str = Field(default="Day 1")
    topic: str = Field(...)
    estimated_minutes: int = Field(default=60)
    action_items: List[str] = Field(default_factory=list)


class InterviewPlan(BaseModel):
    target_role: str = Field(default="Staff AI Systems Engineer")
    company: str = Field(default="Target Company")
    executive_summary: str = Field(default="Comprehensive interview preparation plan")
    match_score: float = Field(default=0.92, description="Candidate alignment score 0.0 to 1.0")
    identified_strengths: List[str] = Field(default_factory=list)
    skill_gaps: List[str] = Field(default_factory=list)
    technical_questions: List[InterviewQuestion] = Field(default_factory=list)
    behavioral_questions: List[InterviewQuestion] = Field(default_factory=list)
    study_plan: List[StudyItem] = Field(default_factory=list)
    strategic_recommendations: List[str] = Field(default_factory=list)
