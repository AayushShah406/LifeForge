import pytest
from app.agents.supervisor import supervisor_agent
from app.agents.state import LifeForgeWorkflowState


@pytest.mark.asyncio
async def test_supervisor_vague_goal_requires_clarification():
    """Verify Supervisor detects underspecified goals and flags clarification."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_123",
        "goal": "help",
        "intent": {},
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

    intent = await supervisor_agent.analyze_intent(state)
    assert intent.requires_clarification is True
    assert intent.clarification_prompt is not None


@pytest.mark.asyncio
async def test_supervisor_analyzes_interview_goal():
    """Verify Supervisor analyzes detailed goal and extracts category and entities."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_456",
        "goal": "Prepare me for my interview next Thursday at Google for Senior AI Systems Engineer.",
        "intent": {},
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

    intent = await supervisor_agent.analyze_intent(state)
    assert intent.requires_clarification is False
    assert intent.category == "interview"
    assert "interview" in intent.suggested_agents


@pytest.mark.asyncio
async def test_supervisor_routing_decision():
    """Verify Supervisor correctly routes to the next pending step in the plan."""
    state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": "wf_test_789",
        "goal": "Analyze my resume and job description.",
        "intent": {"category": "interview"},
        "plan": {
            "steps": [
                {"id": "step_doc", "agent": "document", "description": "Parse resume", "dependencies": []},
                {"id": "step_prep", "agent": "interview", "description": "Generate questions", "dependencies": ["step_doc"]}
            ]
        },
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

    decision = await supervisor_agent.determine_next_step(state)
    assert decision.next_agent == "document"
    assert decision.target_step_id == "step_doc"
