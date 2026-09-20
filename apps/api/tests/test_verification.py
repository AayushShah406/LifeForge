import pytest
from app.agents.verification import verification_agent
from app.agents.state import LifeForgeWorkflowState
from app.schemas.agent_state import PlanStep


@pytest.mark.asyncio
async def test_verification_agent_approves_high_quality_output():
    """Verify VerificationAgent inspects complete output and produces an approval scorecard."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_123",
        "goal": "Prepare me for my interview next Thursday.",
        "intent": {},
        "plan": {},
        "current_step": "step_research",
        "completed_steps": [],
        "failed_steps": [],
        "agent_outputs": {},
        "retrieved_context": [],
        "memory_context": [],
        "tool_results": [],
        "pending_approvals": [],
        "verification_results": {},
        "errors": [],
        "final_result": None,
        "iteration_count": 0,
        "is_interrupted": False
    }

    step = PlanStep(
        id="step_research",
        agent="research",
        description="Research target company engineering culture and technical interview expectations"
    )

    high_quality_output = {
        "research_summary": "Extensive investigation of AI infrastructure, LangGraph adoption, and distributed serving.",
        "company_insights": {
            "values": ["High agency", "rigorous verification", "production velocity"],
            "tech_stack": ["Python", "FastAPI", "Weaviate", "PostgreSQL"]
        },
        "sources": [
            {"title": "Engineering Architecture Blog", "url": "https://example.com/blog/2026", "credibility": 0.95}
        ]
    }

    report = await verification_agent.verify_step_output(state, step, high_quality_output)

    assert report is not None
    assert report.status in ["approved", "needs_revision"]
    assert report.confidence >= 0.70
    assert report.dimension_scores is not None
    assert "relevance" in report.dimension_scores
    assert "factual_grounding" in report.dimension_scores


@pytest.mark.asyncio
async def test_verification_agent_flags_empty_output():
    """Verify VerificationAgent detects empty or non-substantive agent output."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_123",
        "goal": "Prepare me for my interview.",
        "intent": {},
        "plan": {},
        "current_step": "step_empty",
        "completed_steps": [],
        "failed_steps": [],
        "agent_outputs": {},
        "retrieved_context": [],
        "memory_context": [],
        "tool_results": [],
        "pending_approvals": [],
        "verification_results": {},
        "errors": [],
        "final_result": None,
        "iteration_count": 0,
        "is_interrupted": False
    }

    step = PlanStep(
        id="step_empty",
        agent="interview",
        description="Generate technical questions"
    )

    report = await verification_agent.verify_step_output(state, step, {})
    assert report.status in ["needs_revision", "failed"]
    assert len(report.issues) > 0 or len(report.recommendations) > 0
