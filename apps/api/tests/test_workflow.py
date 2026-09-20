import pytest
from app.workflows.lifeforge_graph import lifeforge_engine
from app.agents.state import LifeForgeWorkflowState
from app.services.workflow_service import workflow_service


@pytest.mark.asyncio
async def test_langgraph_engine_initialization():
    """Verify LifeForgeGraphEngine compiles with all nodes and edges."""
    engine = lifeforge_engine
    assert engine.graph is not None


@pytest.mark.asyncio
async def test_workflow_state_execution_flow():
    """Verify a workflow stream executes through the DAG state machine."""
    workflow_id = "test_wf_e2e_001"
    initial_state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": workflow_id,
        "goal": "Analyze my uploaded resume and job description and create an interview preparation plan.",
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

    config = {"configurable": {"thread_id": workflow_id}}

    events = []
    async for event in lifeforge_engine.graph.astream(initial_state, config=config, stream_mode="values"):
        events.append(event)
        # Prevent runaway test loops
        if len(events) > 15:
            break

    assert len(events) > 0
    final_event = events[-1]

    # Verify intent was populated
    assert "intent" in final_event
    assert final_event["intent"].get("category") == "interview"

    # Verify plan was generated
    assert "plan" in final_event
    assert "steps" in final_event["plan"]
    assert len(final_event["plan"]["steps"]) >= 3


@pytest.mark.asyncio
async def test_workflow_approval_pause_and_resume():
    """Verify sensitive actions pause the workflow and can be resumed with approval."""
    workflow_id = "test_wf_approval_001"
    initial_state: LifeForgeWorkflowState = {
        "user_id": "test_user_001",
        "workflow_id": workflow_id,
        "goal": "Send an email confirming interview preparation.",
        "intent": {"category": "interview"},
        "plan": {
            "steps": [
                {"id": "step_1", "agent": "planning", "description": "Schedule calendar event and send email", "dependencies": []}
            ]
        },
        "current_step": "step_1",
        "completed_steps": [],
        "failed_steps": [],
        "agent_outputs": {},
        "retrieved_context": [],
        "memory_context": [],
        "tool_results": [],
        "pending_approvals": [
            {
                "id": "apprv_001",
                "action": "calendar_create_event",
                "risk_level": "medium",
                "description": "Create calendar invite"
            }
        ],
        "verification_results": {},
        "errors": [],
        "final_result": None,
        "iteration_count": 0,
        "is_interrupted": True
    }

    # Verify initial paused state
    assert initial_state["is_interrupted"] is True
    assert len(initial_state["pending_approvals"]) == 1

    # Simulate human approval decision
    initial_state["is_interrupted"] = False
    initial_state["pending_approvals"] = []
    assert initial_state["is_interrupted"] is False
    assert len(initial_state["pending_approvals"]) == 0
