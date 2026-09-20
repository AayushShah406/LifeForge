"""End-to-End Test for Workflow 2 (Section 54).

Goal:
"Prepare me for my interview next Thursday."
Includes: Memory retrieval, calendar availability, interview plan, calendar proposal, and HITL approval.
"""
import pytest
from app.database import init_db
from app.agents.memory import memory_agent
from app.agents.calendar import calendar_agent
from app.agents.interview import interview_agent
from app.agents.planning import planning_agent
from app.workflows.human_approval import human_approval_manager


@pytest.mark.asyncio
async def test_e2e_interview_next_thursday_workflow():
    """Execute complete Section 54 workflow with memory retrieval and HITL calendar approval gate."""
    await init_db()
    user_id = "test_user_calendar_wf"
    workflow_id = "wf_calendar_prep_test"

    # 1. Memory retrieval
    # Pre-seed user memory
    await memory_agent.extract_and_store(
        user_id=user_id,
        text_content="User prefers mock interview sessions in late afternoon (after 2 PM)."
    )
    relevant_memories = await memory_agent.retrieve_relevant_memories(
        user_id=user_id,
        goal="Prepare me for my interview next Thursday"
    )
    assert len(relevant_memories) >= 1

    # 2. Calendar availability check
    available_slots = await calendar_agent.check_availability(
        user_id=user_id,
        target_date_str="2026-09-24",
        duration_minutes=60
    )
    assert len(available_slots) >= 1

    # 3. Interview Agent generates plan
    interview_plan = await interview_agent.generate_preparation_plan(
        resume_text="Senior AI Systems Engineer with LangGraph experience",
        jd_text="Staff AI Engineer at NextGen AI Labs"
    )
    assert interview_plan.match_score >= 0.8

    # 4. Planning Agent generates preparation tasks
    tasks = await planning_agent.generate_tasks_for_plan(
        plan_summary=interview_plan.executive_summary,
        target_role="Staff AI Systems Engineer"
    )
    assert len(tasks) >= 2

    # 5. Calendar Agent proposes event (sensitive action)
    event_proposal = await calendar_agent.propose_interview_prep_event(
        user_id=user_id,
        interview_role="Staff AI Systems Engineer",
        target_date="2026-09-24"
    )
    assert event_proposal.requires_approval is True

    # 6. Human-in-the-Loop approval gate
    approval = await human_approval_manager.create_approval_request(
        workflow_id=workflow_id,
        user_id=user_id,
        action_type="calendar_create",
        title="Schedule Mock Interview Session",
        description=event_proposal.description,
        payload=event_proposal.model_dump()
    )
    assert approval.status == "pending"

    # 7. Human reviews and approves
    decision_result = await human_approval_manager.decide_approval(
        approval_id=approval.id,
        decision="approved",
        comment="Approved by candidate for next Thursday afternoon"
    )
    assert decision_result["decision"] == "approved"
    assert decision_result["workflow_id"] == workflow_id
