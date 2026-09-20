"""Test all 10 specialized agents (Sections 17-24, 31, 106)."""
import pytest
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


@pytest.mark.asyncio
async def test_all_10_specialized_agents():
    """Verify each of the 10 specialized agents responds with expected structured output."""
    # 1. Supervisor
    intent = await supervisor_agent.analyze_intent_raw("Prepare me for my Staff AI Systems Engineer interview.")
    assert intent is not None

    # 2. Planner
    plan = await planner_agent.generate_plan_raw("Prepare interview plan", "career_ops")
    assert plan is not None
    assert len(plan.steps) >= 3

    # 3. Research
    research = await research_agent.search_and_synthesize("NextGen AI Labs tech stack")
    assert research is not None

    # 4. Document
    doc_out = await document_agent.analyze_candidate(
        resume_text="Senior AI Engineer with 6 years experience in LangGraph and Weaviate.",
        jd_text="Staff AI Engineer: LangGraph, Weaviate Cloud v4, Gemini 3."
    )
    assert doc_out is not None

    # 5. Memory
    memories = await memory_agent.extract_and_store(
        user_id="usr_test_agent",
        text_content="I strongly prefer using Python and PostgreSQL for agent platforms."
    )
    assert len(memories) >= 1

    # 6. Interview
    interview_plan = await interview_agent.generate_preparation_plan(
        resume_text="Senior AI Systems Engineer",
        jd_text="Staff AI Systems Engineer at NextGen AI Labs"
    )
    assert interview_plan.match_score >= 0.8
    assert len(interview_plan.technical_questions) >= 1

    # 7. Planning
    tasks = await planning_agent.generate_tasks_for_plan(
        plan_summary="Interview preparation",
        target_role="Staff AI Engineer"
    )
    assert len(tasks) >= 1

    # 8. Calendar
    proposal = await calendar_agent.propose_interview_prep_event(
        user_id="usr_test_agent",
        interview_role="Staff AI Systems Engineer"
    )
    assert proposal.requires_approval is True

    # 9. Email
    draft = await email_agent.draft_followup_email(
        interviewer_name="Dr. Smith",
        company="NextGen AI Labs",
        role="Staff AI Systems Engineer",
        highlights=["LangGraph state machines", "Weaviate multi-tenancy"]
    )
    assert draft.requires_approval is True

    # 10. Verification
    verif = await verification_agent.verify_interview_plan(
        plan_content=interview_plan.model_dump_json(),
        source_context="Candidate has 6 years LangGraph experience"
    )
    assert verif.is_valid is True
    assert verif.status == "approved"
