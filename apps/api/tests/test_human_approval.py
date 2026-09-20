import pytest
from app.workflows.human_approval import human_approval_manager
from app.database.models import Workflow
from app.database.session import async_session_factory
import uuid


@pytest.mark.asyncio
async def test_human_approval_lifecycle():
    """Verify approval creation, pending status, and approval decision resolution."""
    workflow_id = str(uuid.uuid4())
    async with async_session_factory() as session:
        wf = Workflow(
            id=workflow_id,
            user_id="user_123",
            title="Interview Prep",
            status="running"
        )
        session.add(wf)
        await session.commit()

    # Create approval
    req = await human_approval_manager.create_approval_request(
        workflow_id=workflow_id,
        step_id="schedule_session",
        action_type="calendar_create",
        title="Schedule Mock Interview",
        description="Schedule on Thursday 6:00 PM",
        payload={"title": "Mock Interview", "time": "18:00"}
    )
    assert req.id is not None
    assert req.status == "pending"

    # Decide approval
    res = await human_approval_manager.decide_approval(
        approval_id=req.id,
        decision="approved",
        comment="Approved by candidate."
    )
    assert res["decision"] == "approved"
    assert res["workflow_id"] == workflow_id
