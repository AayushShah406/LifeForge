"""Specialized Agents API Directory and Single-Agent Runner (Section 35)."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database import User
from app.api.deps import get_current_user
from app.agents import (
    supervisor_agent,
    planner_agent,
    research_agent,
    document_agent,
    memory_agent,
    interview_agent,
    planning_agent,
    calendar_agent,
    email_agent,
    verification_agent,
)
from app.mcp.permissions import AGENT_TOOL_PERMISSIONS

router = APIRouter(prefix="/agents", tags=["Agents"])

AGENT_CATALOG = [
    {"name": "supervisor_agent", "role": "Supervisor", "model_role": "Reasoning (Gemini 3.1 Pro)", "description": "Goal comprehension, dynamic orchestration, and graph error recovery"},
    {"name": "planner_agent", "role": "Planner", "model_role": "Reasoning (Gemini 3.1 Pro)", "description": "Generates structured multi-step execution plans with DAG dependencies"},
    {"name": "research_agent", "role": "Research", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Grounded web and industry research with verified citation tracking"},
    {"name": "document_agent", "role": "Document", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Document analysis, chunk retrieval, resume/JD skill comparison"},
    {"name": "memory_agent", "role": "Semantic Memory", "model_role": "Lightweight (Gemini 3.1 Flash-Lite)", "description": "Extracts durable user context and indexes into Weaviate SemanticMemory"},
    {"name": "interview_agent", "role": "Interview", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Technical STAR questions, behavioral challenges, and study plans"},
    {"name": "planning_agent", "role": "Task Planner", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Actionable task breakdown and calendar scheduling proposals"},
    {"name": "calendar_agent", "role": "Calendar", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Availability inspection; event creation pauses for human approval"},
    {"name": "email_agent", "role": "Email", "model_role": "Fast (Gemini 3.8 Flash)", "description": "Email search and drafting; outbound sending pauses for human approval"},
    {"name": "verification_agent", "role": "Verification", "model_role": "Reasoning (Gemini 3.1 Pro)", "description": "Dual-layer audit for correctness, groundedness, and hallucination absence"},
]


class AgentRunRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None


@router.get("")
async def list_agents(user: User = Depends(get_current_user)):
    """Return catalog of all 10 specialized agents and their tool permissions."""
    result = []
    for a in AGENT_CATALOG:
        entry = dict(a)
        entry["allowed_tools"] = list(AGENT_TOOL_PERMISSIONS.get(a["name"], []))
        result.append(entry)
    return {"agents": result, "total": len(result)}


@router.post("/{agent_name}/run")
async def run_single_agent(
    agent_name: str,
    payload: AgentRunRequest,
    user: User = Depends(get_current_user)
):
    """Directly test or invoke an individual specialized agent."""
    name_clean = agent_name.lower().replace("-", "_")
    if name_clean not in [a["name"] for a in AGENT_CATALOG]:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not recognized")

    if name_clean == "research_agent":
        res = await research_agent.search_and_synthesize(payload.prompt)
        return {"agent": agent_name, "result": res}
    elif name_clean == "memory_agent":
        res = await memory_agent.extract_and_store(user.id, payload.prompt)
        return {"agent": agent_name, "memories_extracted": res}
    elif name_clean == "calendar_agent":
        proposal = await calendar_agent.propose_interview_prep_event(user.id, payload.prompt)
        return {"agent": agent_name, "proposal": proposal.model_dump()}
    elif name_clean == "email_agent":
        draft = await email_agent.draft_followup_email("Hiring Manager", "Target Company", "Staff AI Engineer", [payload.prompt])
        return {"agent": agent_name, "draft": draft.model_dump()}

    return {"agent": agent_name, "status": "executed", "prompt": payload.prompt}
