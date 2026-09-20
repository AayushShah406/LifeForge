from typing import Any, Dict, List, Optional
import json
from app.models import reasoning_model
from app.schemas.agent_state import LifeForgeState, Plan, PlanStep


class PlannerAgent:
    """Planner Agent powered by Gemini 3.1 Pro for structured DAG workflow planning."""

    def __init__(self):
        self.provider = reasoning_model()


    async def generate_plan(self, state: Any) -> Plan:
        goal = getattr(state, "goal", None) or (state.get("goal") if isinstance(state, dict) else "")
        intent_obj = getattr(state, "intent", None) or (state.get("intent") if isinstance(state, dict) else None)
        intent_desc = getattr(intent_obj, "intent", None) or (intent_obj.get("intent") if isinstance(intent_obj, dict) else "general")
        entities = getattr(intent_obj, "entities", None) or (intent_obj.get("entities") if isinstance(intent_obj, dict) else {})
        entities_str = json.dumps(entities)
        memory_ctx = getattr(state, "memory_context", None) or (state.get("memory_context") if isinstance(state, dict) else [])
        memories_str = chr(10).join(memory_ctx) if memory_ctx else "No prior memories."

        prompt = (
            f"You are the Lead Workflow Architect for LifeForge.\n"
            f"Goal: '{goal}'\n"
            f"Intent: {intent_desc}\n"
            f"Extracted Entities: {entities_str}\n"
            f"Personal Context: {memories_str}\n\n"
            "Create a structured, multi-step execution plan representing a Directed Acyclic Graph (DAG).\n"
            "Valid Agents for steps:\n"
            "- 'research': Web research, source gathering, competitor & company information.\n"
            "- 'document': Resume, job description, or document chunk analysis from Weaviate RAG.\n"
            "- 'interview': Skill matching, gap analysis, mock interview questions, interview briefing.\n"
            "- 'planning': Schedule creation, calendar availability, deadline planning, action items.\n\n"
            "Rules:\n"
            "1. Define clear dependencies: steps that require outputs of previous steps must list their step IDs in 'dependencies'.\n"
            "2. Mark 'requires_approval': true ONLY on steps that mutate calendar, send emails, or execute irreversible external actions.\n"
            "3. Support parallel steps: initial research and document parsing can run with empty dependencies [].\n"
            "4. Respond strictly in JSON conforming to the Plan schema:\n"
            "{\n"
            "  \"goal\": \"...\",\n"
            "  \"workflow_type\": \"interview_prep|document_analysis|study_plan|general\",\n"
            "  \"steps\": [\n"
            "    {\"id\": \"step_id\", \"agent\": \"research|document|interview|planning\", \"description\": \"...\", \"dependencies\": [], \"requires_approval\": false, \"status\": \"pending\", \"tool_hints\": []}\n"
            "  ],\n"
            "  \"estimated_duration_minutes\": 45,\n"
            "  \"requires_external_mutations\": true\n"
            "}"
        )

        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=Plan,
            temperature=0.1
        )

        if resp.structured:
            return resp.structured

        try:
            data = json.loads(resp.content)
            return Plan.model_validate(data)
        except Exception:
            # Dynamic heuristic plan tailored to the user's explicit objective
            goal_lower = goal.lower()
            clean_goal = goal.strip() if goal else "Target Objective"
            topic = clean_goal.split(":")[0] if ":" in clean_goal else clean_goal
            if len(topic) > 40:
                topic = topic[:40] + "..."

            if "interview" in goal_lower:
                return Plan(
                    goal=goal,
                    workflow_type="interview_prep",
                    steps=[
                        PlanStep(id="research_company", agent="research", description=f"Research company context and technical expectations for {topic}", dependencies=[]),
                        PlanStep(id="analyze_requirements", agent="document", description="Extract role requirements, core competencies, and evaluation criteria", dependencies=[]),
                        PlanStep(id="generate_questions", agent="interview", description="Synthesize targeted technical, behavioral, and architecture questions", dependencies=["research_company", "analyze_requirements"]),
                        PlanStep(id="create_prep_schedule", agent="planning", description="Generate high-yield preparation schedule and milestone review", dependencies=["generate_questions"], requires_approval=True),
                    ],
                    estimated_duration_minutes=45,
                    requires_external_mutations=True
                )
            elif any(k in goal_lower for k in ["cloud", "aws", "infra", "audit", "security", "devops"]):
                return Plan(
                    goal=goal,
                    workflow_type="infrastructure_audit",
                    steps=[
                        PlanStep(id="audit_infrastructure", agent="research", description=f"Scan and inspect cloud infrastructure resources for {topic}", dependencies=[]),
                        PlanStep(id="analyze_logs_metrics", agent="document", description="Analyze utilization metrics, active logs, and configuration state", dependencies=[]),
                        PlanStep(id="draft_remediation_plan", agent="planning", description="Synthesize remediation steps, cost reduction items, and security patches", dependencies=["audit_infrastructure", "analyze_logs_metrics"], requires_approval=True),
                    ],
                    estimated_duration_minutes=35,
                    requires_external_mutations=True
                )
            elif any(k in goal_lower for k in ["study", "learn", "course", "master", "curriculum"]):
                return Plan(
                    goal=goal,
                    workflow_type="learning_plan",
                    steps=[
                        PlanStep(id="research_curriculum", agent="research", description=f"Gather state-of-the-art syllabus, benchmarks, and reference materials for {topic}", dependencies=[]),
                        PlanStep(id="analyze_prerequisites", agent="document", description="Evaluate prerequisites, core concepts, and key skill milestones", dependencies=[]),
                        PlanStep(id="formulate_schedule", agent="planning", description="Structure phased timeline into actionable daily modules and practical projects", dependencies=["research_curriculum", "analyze_prerequisites"], requires_approval=True),
                    ],
                    estimated_duration_minutes=30,
                    requires_external_mutations=True
                )
            else:
                # Tailored system / project / business planning
                return Plan(
                    goal=goal,
                    workflow_type="operational_plan",
                    steps=[
                        PlanStep(id="research_domain_state", agent="research", description=f"Conduct domain intelligence and architecture research for {topic}", dependencies=[]),
                        PlanStep(id="synthesize_specifications", agent="document", description=f"Formulate technical requirements, architecture constraints, and core specifications for {topic}", dependencies=["research_domain_state"]),
                        PlanStep(id="build_implementation_roadmap", agent="planning", description=f"Draft phased implementation roadmap, resource allocation, and milestones for {topic}", dependencies=["synthesize_specifications"]),
                    ],
                    estimated_duration_minutes=30,
                    requires_external_mutations=False
                )

    async def generate_plan_raw(self, goal: str, workflow_type: str = "general") -> Plan:
        """Generate a structured plan directly from raw goal string and workflow type."""
        state = LifeForgeState(
            goal=goal,
            user_id="system",
            workflow_id="temp_plan_eval"
        )
        return await self.generate_plan(state)


planner_agent = PlannerAgent()
