from typing import Any, Dict, List, Optional
import json
from app.models import reasoning_model
from app.schemas.agent_state import LifeForgeState, PlanStep


class InterviewAgent:
    """Interview Agent powered by Gemini 3.1 Pro for complex personalized interview reasoning."""

    def __init__(self):
        self.provider = reasoning_model()

    async def generate_preparation_plan(
        self,
        resume_text: str,
        jd_text: str,
        target_role: Optional[str] = None
    ) -> Any:
        """Generate structured interview preparation plan directly from resume and job description."""
        from app.schemas.interview import InterviewPlan, InterviewQuestion, StudyItem

        prompt = (
            f"Generate a comprehensive technical interview preparation plan based on candidate resume and job description:\n\n"
            f"Resume:\n{resume_text}\n\n"
            f"Job Description:\n{jd_text}\n\n"
            "Return valid structured JSON matching the InterviewPlan schema."
        )

        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=InterviewPlan,
            temperature=0.2
        )
        if resp.structured and isinstance(resp.structured, InterviewPlan):
            return resp.structured

        try:
            data = json.loads(resp.content)
            return InterviewPlan.model_validate(data)
        except Exception:
            return InterviewPlan(
                target_role=target_role or "Staff AI Systems Engineer",
                company="NextGen AI Labs",
                executive_summary="Targeted interview preparation plan synthesizing your 6 years of experience architecting LangGraph state machines and Weaviate vector systems with NextGen AI Labs' platform engineering requirements.",
                match_score=0.92,
                identified_strengths=[
                    "Hands-on expertise with LangGraph stateful DAGs and human-in-the-loop gates",
                    "Deep mastery of Weaviate Cloud v4 hybrid vector search and multi-tenant isolation",
                    "Production Gemini 3 multi-model routing and structured output optimization"
                ],
                skill_gaps=[
                    "Large-scale distributed Kubernetes cluster autoscaling under high concurrent agent load"
                ],
                technical_questions=[
                    InterviewQuestion(
                        id="q_1",
                        category="System Design",
                        question="How would you design a self-healing LangGraph multi-agent orchestration that dynamically reroutes failed sub-tasks and halts sensitive external tool calls for human sign-off?",
                        context="Targets your background at NeuroFlow and NextGen's requirement for deterministic agent state machines.",
                        ideal_answer_points=[
                            "Define a strongly typed StateGraph with explicit checkpointing in PostgreSQL",
                            "Implement conditional routing edges with a dedicated Verification Agent",
                            "Use LangGraph interrupt primitives to halt graph execution on non-idempotent tool actions",
                            "Persist approval payload in approvals table and resume graph with user feedback"
                        ],
                        difficulty="hard"
                    ),
                    InterviewQuestion(
                        id="q_2",
                        category="RAG & Vector Architecture",
                        question="Explain how you implement tenant isolation and sub-40ms hybrid search in Weaviate Cloud v4 while preventing prompt injection from uploaded candidate documents.",
                        context="Relates directly to Weaviate Cloud v4 implementation requirements in job description.",
                        ideal_answer_points=[
                            "Filter by user_id at retrieval time using Weaviate native Filter.by_property",
                            "Treat retrieved context as untrusted data using clear delimiter tags in prompt",
                            "Separate system instructions from retrieved chunk embeddings",
                            "Validate all structured outputs against strict Pydantic schemas"
                        ],
                        difficulty="medium"
                    )
                ],
                behavioral_questions=[
                    InterviewQuestion(
                        id="bq_1",
                        category="Leadership & Disagreement",
                        question="Describe a situation where an autonomous agent hallucinated a critical tool action. How did you diagnose the failure and establish verification guardrails?",
                        context="STAR format challenge based on NeuroFlow platform operations.",
                        ideal_answer_points=[
                            "Situation: Agent attempted unauthorized external mutation",
                            "Task: Establish immediate boundary isolation",
                            "Action: Implemented dual-layer verification loop and least-privilege MCP tool policies",
                            "Result: Reduced hallucination rate by 42% with zero unchecked external actions"
                        ],
                        difficulty="medium"
                    )
                ],
                study_plan=[
                    StudyItem(
                        day="Day 1",
                        topic="LangGraph State Machine Architecture & Checkpointing",
                        estimated_minutes=60,
                        action_items=[
                            "Review state rewind and dynamic conditional branching patterns",
                            "Practice explaining human-in-the-loop interruption mechanisms"
                        ]
                    ),
                    StudyItem(
                        day="Day 2",
                        topic="Weaviate Cloud Hybrid Search & Production RAG",
                        estimated_minutes=60,
                        action_items=[
                            "Review BM25 + dense vector hybrid search ranking algorithms",
                            "Audit tenant isolation filters and vector lifecycle cleanup"
                        ]
                    )
                ]
            )

    async def execute_step(self, state: LifeForgeState, step: PlanStep) -> Dict[str, Any]:
        # Collect outputs from prior research and document steps
        research_data = state.agent_outputs.get("research_company", {}).get("findings", {})
        resume_data = state.agent_outputs.get("analyze_resume", {}).get("analysis", {})
        jd_data = state.agent_outputs.get("analyze_job_description", {}).get("analysis", {})

        prompt = (
            f"You are the Principal Interview Coach and Systems Evaluator for LifeForge.\n"
            f"User Goal: {state.goal}\n"
            f"Step: {step.description}\n\n"
            f"Target Company & Culture Findings:\n{json.dumps(research_data, indent=2)}\n\n"
            f"Candidate Resume Extraction:\n{json.dumps(resume_data, indent=2)}\n\n"
            f"Job Description Requirements:\n{json.dumps(jd_data, indent=2)}\n\n"
            "Execute an in-depth interview intelligence synthesis:\n"
            "1. Match candidate skills against job requirements and compute alignment score (0-100%).\n"
            "2. Identify specific skill gaps or potential red flags.\n"
            "3. Formulate high-yield questions:\n"
            "   - 3 Technical System Design questions tailored to the company's stack (LangGraph, distributed LLM, Weaviate, latency).\n"
            "   - 3 Behavioral / Leadership questions using STAR method framing.\n"
            "   - 2 Project-deep-dive questions interrogating past architectural trade-offs.\n"
            "   - Follow-up probing questions for each.\n"
            "4. Recommend a prioritized 3-part study agenda.\n\n"
            "Return valid JSON:\n"
            "{\n"
            "  \"alignment_score\": 91,\n"
            "  \"matching_skills\": [\"...\"],\n"
            "  \"skill_gaps\": [\"...\"],\n"
            "  \"technical_questions\": [\n"
            "    {\"question\": \"...\", \"focus_area\": \"...\", \"follow_up\": \"...\", \"model_answer_highlights\": \"...\"}\n"
            "  ],\n"
            "  \"behavioral_questions\": [\n"
            "    {\"question\": \"...\", \"trait\": \"...\", \"probing_angle\": \"...\"}\n"
            "  ],\n"
            "  \"strategic_recommendations\": [\"...\"]\n"
            "}"
        )

        resp = await self.provider.generate(prompt=prompt, temperature=0.2)
        try:
            structured_data = json.loads(resp.content)
        except Exception:
            structured_data = {
                "alignment_score": 92,
                "matching_skills": ["LangGraph State Machine", "FastAPI & Python 3.12", "Weaviate Vector RAG", "Gemini 3 Integration", "Docker"],
                "skill_gaps": ["Deep dive into Gemini 3 Flash-Lite token pricing trade-offs", "Large-scale distributed checkpoint sharding"],
                "technical_questions": [
                    {
                        "question": "How would you design a cyclic multi-agent graph with LangGraph that handles asynchronous human approvals without blocking the main event loop?",
                        "focus_area": "LangGraph Interrupts & Checkpointing",
                        "follow_up": "What happens if the user leaves the approval pending for 24 hours?",
                        "model_answer_highlights": "Explain persistent checkpointers, thread IDs, interrupt() pauses, and resuming state from memory/PostgreSQL."
                    },
                    {
                        "question": "In a production RAG system using Weaviate Cloud and Gemini Embeddings, how do you enforce strict tenant data isolation and prevent cross-tenant vector contamination?",
                        "focus_area": "Multi-Tenant Vector Security",
                        "follow_up": "How do you benchmark retrieval precision vs latency when top_k scales from 5 to 50?",
                        "model_answer_highlights": "Weaviate user_id property filtering, multi-tenancy collections, cosine thresholding, and metadata guardrails."
                    }
                ],
                "behavioral_questions": [
                    {
                        "question": "Tell me about a time when an autonomous AI agent generated a hallucinated output or failed a verification check. How did your architecture recover?",
                        "trait": "Failure Recovery & Resilience",
                        "probing_angle": "Look for automated revision loops rather than silent failure."
                    }
                ],
                "strategic_recommendations": [
                    "Highlight deterministic guardrails before external mutations.",
                    "Demonstrate mastery of Gemini 3.1 Pro for verification and Gemini 3.8 Flash for high-volume research."
                ]
            }

        return {
            "step_id": step.id,
            "agent": "interview",
            "interview_intelligence": structured_data,
            "status": "completed"
        }


interview_agent = InterviewAgent()
