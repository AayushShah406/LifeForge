"""Specialized Agents for LifeForge Platform (Sections 17-24, 31-32, 106).

Exposes the 10 canonical specialized agents:
1.  SupervisorAgent
2.  PlannerAgent
3.  ResearchAgent
4.  DocumentAgent
5.  MemoryAgent
6.  InterviewAgent
7.  PlanningAgent
8.  CalendarAgent
9.  EmailAgent
10. VerificationAgent
"""

from app.agents.supervisor import supervisor_agent, SupervisorAgent
from app.agents.planner import planner_agent, PlannerAgent
from app.agents.research import research_agent, ResearchAgent
from app.agents.document import document_agent, DocumentAgent
from app.agents.memory import memory_agent, MemoryAgent
from app.agents.interview import interview_agent, InterviewAgent
from app.agents.planning import planning_agent, PlanningAgent
from app.agents.calendar import calendar_agent, CalendarAgent
from app.agents.email import email_agent, EmailAgent
from app.agents.verification import verification_agent, VerificationAgent

__all__ = [
    "supervisor_agent",
    "SupervisorAgent",
    "planner_agent",
    "PlannerAgent",
    "research_agent",
    "ResearchAgent",
    "document_agent",
    "DocumentAgent",
    "memory_agent",
    "MemoryAgent",
    "interview_agent",
    "InterviewAgent",
    "planning_agent",
    "PlanningAgent",
    "calendar_agent",
    "CalendarAgent",
    "email_agent",
    "EmailAgent",
    "verification_agent",
    "VerificationAgent",
]
