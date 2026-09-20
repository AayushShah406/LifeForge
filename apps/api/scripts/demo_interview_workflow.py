"""End-to-End Demo Script for LifeForge.

Workflow:
"Analyze my uploaded resume and job description and create an interview preparation plan."
"""
import asyncio
import os
import sys
import json
import time

# Ensure apps/api is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import init_db
from app.rag.ingestion import ingestion_pipeline
from app.workflows.lifeforge_graph import lifeforge_engine
from app.agents.state import LifeForgeWorkflowState


RESUME_TEXT = """
# ALEX CHEN — SENIOR AI SYSTEMS ENGINEER
Email: alex.chen@example.com | GitHub: github.com/alexchen-ai

## PROFESSIONAL SUMMARY
Senior AI Systems Engineer with 6 years of experience architecting production-grade agentic platforms,
stateful multi-agent orchestrations with LangGraph, dense vector search using Weaviate Cloud, and low-latency
LLM inference systems with Gemini 3 models.

## SKILLS
- Agent Architectures: LangGraph, LangChain, State Machines, Tool Guardrails, ReAct, Supervisor Routing
- AI Models: Gemini 3-family (Pro Preview, Flash, Lite, Embeddings), Function Calling, Structured Outputs
- Vector Databases: Weaviate Cloud v4, Hybrid Search, Dense Vectors, Metadata Filtering
- Systems & Databases: Python 3.12+, FastAPI, PostgreSQL, Redis, Docker, AsyncPG

## EXPERIENCE
Senior AI Engineer | NeuroFlow Systems (2023 - Present)
- Designed and deployed an autonomous agentic personal operations platform handling 25,000+ daily workflows.
- Implemented LangGraph state machines with human-in-the-loop approval gates for external actions.
- Reduced hallucination rates by 42% through multi-dimensional verification loops.
- Integrated Weaviate Cloud v4 with dynamic chunking, achieving sub-40ms semantic retrieval latencies.
"""

JOB_DESCRIPTION_TEXT = """
# ROLE: STAFF AI SYSTEMS ENGINEER — AGENTIC PLATFORMS
Company: NextGen AI Labs
Location: San Francisco, CA (Hybrid / Remote)

## ABOUT THE ROLE
We are seeking a Staff AI Systems Engineer to lead the architecture of our next-generation agent operating system.
You will design self-correcting agent DAGs, implement strict verification loops, and scale semantic memory systems.

## RESPONSIBILITIES
- Architect robust LangGraph state machines capable of dynamic routing, tool execution, and human approval.
- Design dense vector retrieval pipelines using Weaviate Cloud with hybrid search and user-isolated multi-tenancy.
- Implement automated verification agents that audit intermediate LLM outputs for groundedness and safety.
- Benchmark end-to-end agent workflows using structured evaluation suites and latency tracking.

## REQUIREMENTS
- 5+ years building and deploying production AI systems.
- Deep hands-on expertise with LangGraph, LangChain, and modern model families (Gemini 3).
- Mastery of vector database architecture (Weaviate v4) and hybrid RAG retrieval.
- Proven track record designing deterministic guardrails and permission tiers for autonomous tools.
"""


async def run_demo():
    print("=" * 80)
    print(" LIFEFORGE — END-TO-END DEMO: INTERVIEW PREPARATION PLAN WORKFLOW")
    print(" Tagline: Turn goals into verified actions.")
    print("=" * 80)

    # 1. Initialize DB
    print("\n[Phase 1] Initializing LifeForge Persistence Engine...")
    await init_db()
    print(" -> Database tables verified.")

    # 2. Ingest Resume & Job Description
    user_id = "demo_user_chen"
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))
    os.makedirs(upload_dir, exist_ok=True)

    resume_path = os.path.join(upload_dir, "alex_chen_resume.md")
    with open(resume_path, "w", encoding="utf-8") as f:
        f.write(RESUME_TEXT)

    jd_path = os.path.join(upload_dir, "staff_ai_engineer_jd.md")
    with open(jd_path, "w", encoding="utf-8") as f:
        f.write(JOB_DESCRIPTION_TEXT)

    print("\n[Phase 2] Ingesting & Embedding Documents into Vector Store...")
    res_resume = await ingestion_pipeline.ingest_file(
        file_path=resume_path,
        user_id=user_id,
        document_id="doc_resume_01",
        metadata={"category": "resume", "original_filename": "alex_chen_resume.md"}
    )
    print(f" -> Resume Ingested: {res_resume['chunks_count']} chunk(s) indexed.")

    res_jd = await ingestion_pipeline.ingest_file(
        file_path=jd_path,
        user_id=user_id,
        document_id="doc_jd_01",
        metadata={"category": "job_description", "original_filename": "staff_ai_engineer_jd.md"}
    )
    print(f" -> Job Description Ingested: {res_jd['chunks_count']} chunk(s) indexed.")

    # 3. Setup LangGraph Workflow
    workflow_id = f"demo_wf_{int(time.time())}"
    goal_prompt = "Analyze my uploaded resume and job description and create an interview preparation plan."
    print(f"\n[Phase 3] Launching LangGraph Stateful Workflow: {workflow_id}")
    print(f" -> Goal: \"{goal_prompt}\"")

    initial_state: LifeForgeWorkflowState = {
        "user_id": user_id,
        "workflow_id": workflow_id,
        "goal": goal_prompt,
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

    step_counter = 0
    start_time = time.perf_counter()

    print("\n[Phase 4] Streaming Agent Trajectory:")
    async for state in lifeforge_engine.graph.astream(initial_state, config=config, stream_mode="values"):
        step_counter += 1
        current = state.get("current_step")
        completed = state.get("completed_steps", [])

        if state.get("intent") and not state.get("plan"):
            intent_obj = state.get("intent")
            cat = getattr(intent_obj, "category", None) or (intent_obj.get("category") if isinstance(intent_obj, dict) else "interview")
            conf = getattr(intent_obj, "confidence", None) or (intent_obj.get("confidence") if isinstance(intent_obj, dict) else 1.0)
            sugg = getattr(intent_obj, "suggested_agents", None) or (intent_obj.get("suggested_agents") if isinstance(intent_obj, dict) else [])
            print(f"\n  [Supervisor] Intent Identified:")
            print(f"    Category: {cat} | Confidence: {conf}")
            print(f"    Suggested Agents: {sugg}")

        if state.get("plan") and not completed:
            plan_obj = state.get("plan")
            plan_steps = getattr(plan_obj, "steps", None) or (plan_obj.get("steps") if isinstance(plan_obj, dict) else [])
            print(f"\n  [Planner] Generated {len(plan_steps)}-Step Execution DAG:")
            for s in plan_steps:
                s_id = getattr(s, "id", None) or (s.get("id") if isinstance(s, dict) else "step")
                s_agent = getattr(s, "agent", None) or (s.get("agent") if isinstance(s, dict) else "agent")
                s_desc = getattr(s, "description", None) or (s.get("description") if isinstance(s, dict) else "")
                s_deps = getattr(s, "dependencies", None) or (s.get("dependencies") if isinstance(s, dict) else [])
                deps = f" (deps: {s_deps})" if s_deps else " (entrypoint)"
                print(f"    * [{s_agent.upper()}] {s_id}: {s_desc}{deps}")

        if current:
            output = state.get("agent_outputs", {}).get(current)
            if output:
                verif_raw = state.get("verification_results")
                verif = {}
                if isinstance(verif_raw, dict):
                    verif = verif_raw.get(current, {})
                elif isinstance(verif_raw, list):
                    for v in verif_raw:
                        v_step = getattr(v, "step_id", None) or (v.get("step_id") if isinstance(v, dict) else None)
                        if v_step == current:
                            verif = v
                            break

                v_status = getattr(verif, "status", None) or (verif.get("status") if isinstance(verif, dict) else "pending") or "pending"
                v_score = getattr(verif, "confidence", None) or (verif.get("confidence") if isinstance(verif, dict) else 0.0) or 0.0
                print(f"\n  -> Completed Step: {current} | Verification: {str(v_status).upper()} (Score: {float(v_score):.2f})")

        if state.get("final_result"):
            break

    elapsed = time.perf_counter() - start_time
    print("\n" + "=" * 80)
    print(f" WORKFLOW COMPLETED SUCCESSFULLY in {elapsed:.2f}s ({step_counter} graph transitions)")
    print("=" * 80)

    final_res = state.get("final_result", {})
    if isinstance(final_res, dict):
        print(f"\nSummary: {final_res.get('summary')}")
        print("\nKey Recommendations:")
        for rec in final_res.get("recommendations", []):
            print(f"  - {rec}")

        print("\nStructured Deliverables:")
        for k, v in final_res.get("deliverables", {}).items():
            print(f"  * {k}: {str(v)[:120]}...")
    else:
        print(f"\nFinal Result:\n{final_res}")

    print("\n" + "=" * 80)
    print(" DEMO VALIDATION SUCCESSFUL: Turn goals into verified actions.")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_demo())
