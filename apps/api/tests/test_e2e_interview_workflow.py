"""End-to-End Test for Workflow 1 (Section 53).

Goal:
"Analyze my uploaded resume and job description and create an interview preparation plan."
"""
import os
import tempfile
import pytest

from app.database import init_db
from app.rag.ingestion import ingestion_pipeline
from app.workflows.lifeforge_graph import lifeforge_engine
from app.agents.state import LifeForgeWorkflowState


RESUME_MD = """
# ALEX CHEN — SENIOR AI SYSTEMS ENGINEER
Email: alex.chen@example.com

## PROFESSIONAL SUMMARY
Senior AI Systems Engineer with 6 years experience building LangGraph state machines,
Weaviate Cloud vector systems, and Gemini 3 model routing.

## SKILLS
- LangGraph, LangChain, State Machines, ReAct, Supervisor Routing
- Weaviate Cloud v4, Hybrid Search, Dense Vectors, Multi-Tenant Isolation
- Python 3.12, FastAPI, PostgreSQL, Redis, Docker
"""

JOB_DESCRIPTION_MD = """
# ROLE: STAFF AI SYSTEMS ENGINEER — AGENTIC PLATFORMS
Company: NextGen AI Labs

## REQUIREMENTS
- 5+ years building and deploying production AI systems.
- Deep expertise in LangGraph multi-agent DAGs and state machines.
- Mastery of Weaviate Cloud v4 vector search and RAG retrieval.
- Experience with Gemini 3 multi-model routing and verification loops.
"""


@pytest.mark.asyncio
async def test_e2e_resume_and_jd_interview_workflow():
    """Execute complete Section 53 workflow from ingestion to verified interview preparation plan."""
    # 1. Initialize DB
    await init_db()

    # 2. Ingest Resume and Job Description
    user_id = "test_user_e2e_01"
    with tempfile.TemporaryDirectory() as tmpdir:
        resume_path = os.path.join(tmpdir, "resume.md")
        with open(resume_path, "w", encoding="utf-8") as f:
            f.write(RESUME_MD)

        jd_path = os.path.join(tmpdir, "job_description.md")
        with open(jd_path, "w", encoding="utf-8") as f:
            f.write(JOB_DESCRIPTION_MD)

        res_resume = await ingestion_pipeline.ingest_file(
            file_path=resume_path,
            user_id=user_id,
            document_id="doc_resume_test",
            metadata={"category": "resume", "original_filename": "resume.md"}
        )
        assert res_resume["status"] == "indexed"
        assert res_resume["chunks_count"] >= 1

        res_jd = await ingestion_pipeline.ingest_file(
            file_path=jd_path,
            user_id=user_id,
            document_id="doc_jd_test",
            metadata={"category": "job_description", "original_filename": "job_description.md"}
        )
        assert res_jd["status"] == "indexed"
        assert res_jd["chunks_count"] >= 1

    # 3. Setup and run LangGraph Workflow
    workflow_id = "wf_e2e_interview_test"
    goal = "Analyze my uploaded resume and job description and create an interview preparation plan."

    initial_state: LifeForgeWorkflowState = {
        "user_id": user_id,
        "workflow_id": workflow_id,
        "goal": goal,
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

    final_state = await lifeforge_engine.run(initial_state)

    # 4. Assert workflow execution completed with verified interview plan
    assert final_state is not None
    assert len(final_state.get("completed_steps", [])) >= 3
    final_result = final_state.get("final_result")
    assert final_result is not None
    assert "status" in final_result
    assert final_result["status"] in ("completed", "approved")
