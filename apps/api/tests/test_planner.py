import pytest
from app.agents.planner import planner_agent
from app.agents.state import LifeForgeWorkflowState


@pytest.mark.asyncio
async def test_planner_generates_dag_plan():
    """Verify PlannerAgent generates structured DAG plan with dependencies."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_123",
        "goal": "Analyze my uploaded resume and job description and create an interview preparation plan.",
        "intent": {
            "intent": "interview_preparation",
            "category": "interview",
            "confidence": 0.96,
            "entities": {"company": "Anthropic", "role": "Senior Systems Engineer"}
        },
        "plan": {},
        "current_step": None,
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

    plan = await planner_agent.generate_plan(state)

    assert plan is not None
    assert len(plan.steps) >= 3
    assert plan.goal == state["goal"]

    # Verify agent assignments
    scheduled_agents = [s.agent for s in plan.steps]
    assert any(a in ["document", "research"] for a in scheduled_agents)
    assert any(a in ["interview", "planning"] for a in scheduled_agents)

    # Verify DAG dependency structure
    has_dependencies = any(len(s.dependencies) > 0 for s in plan.steps)
    assert has_dependencies is True

    # Verify each step has an ID and description
    for step in plan.steps:
        assert step.id
        assert step.description
        assert step.agent in ["document", "research", "interview", "planning"]
