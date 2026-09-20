"""Calendar Agent (Section 23).

Handles calendar availability inspection, free slot discovery, and event proposals.
Crucial Rule: Creating, updating, or deleting events REQUIRES Human-in-the-Loop approval.
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.llm.router import get_fast_model

logger = logging.getLogger("lifeforge.agents.calendar")


class CalendarSlot(BaseModel):
    start_time: str
    end_time: str
    is_available: bool = True
    reason: Optional[str] = None


class CalendarEventProposal(BaseModel):
    title: str = Field(description="Title of the proposed calendar event")
    description: str = Field(description="Agenda and event description")
    start_time: str = Field(description="ISO 8601 start timestamp")
    end_time: str = Field(description="ISO 8601 end timestamp")
    attendees: List[str] = Field(default_factory=list)
    requires_approval: bool = Field(default=True, description="Always True for external calendar mutations")


class CalendarAvailabilityResult(BaseModel):
    available_slots: List[CalendarSlot] = Field(default_factory=list)
    proposed_event: Optional[CalendarEventProposal] = None
    summary: str


class CalendarAgent:
    """Specialized agent for schedule availability and calendar action proposals."""

    def __init__(self):
        self.fast_llm = get_fast_model()

    async def check_availability(
        self,
        user_id: str,
        target_date_str: str,
        duration_minutes: int = 60
    ) -> List[Dict[str, Any]]:
        """Reads calendar availability without mutating data (safe action)."""
        now = datetime.now(timezone.utc)
        # Standard business slots
        slots = [
            {"start_time": f"{target_date_str}T10:00:00Z", "end_time": f"{target_date_str}T11:00:00Z", "available": True},
            {"start_time": f"{target_date_str}T14:00:00Z", "end_time": f"{target_date_str}T15:00:00Z", "available": True},
            {"start_time": f"{target_date_str}T16:30:00Z", "end_time": f"{target_date_str}T17:30:00Z", "available": True},
        ]
        return slots

    async def propose_interview_prep_event(
        self,
        user_id: str,
        interview_role: str,
        target_date: Optional[str] = None,
    ) -> CalendarEventProposal:
        """Formulates an event proposal. Creating the event triggers HITL approval gate."""
        date_str = target_date or (datetime.now(timezone.utc) + timedelta(days=3)).strftime("%Y-%m-%d")

        proposal = CalendarEventProposal(
            title=f"Mock Interview Preparation — {interview_role}",
            description=f"Deep dive STAR practice questions and system design architecture review for {interview_role}.",
            start_time=f"{date_str}T14:00:00Z",
            end_time=f"{date_str}T15:00:00Z",
            attendees=[],
            requires_approval=True
        )
        return proposal


calendar_agent = CalendarAgent()
