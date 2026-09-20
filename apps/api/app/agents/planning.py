from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone
import json
from app.models import fast_model
from app.tools.registry import tool_registry
from app.schemas.agent_state import LifeForgeState, PlanStep, ApprovalRequest


class PlanningAgent:
    """Planning Agent for study curricula, calendar scheduling, and deterministic task creation."""

    def __init__(self):
        self.provider = fast_model()

    async def generate_tasks_for_plan(
        self,
        plan_summary: str,
        target_role: str = "Staff AI Systems Engineer",
        **kwargs: Any
    ) -> List[Dict[str, Any]]:
        """Generate structured preparation tasks from plan summary."""
        tasks = [
            {
                "id": "task_1",
                "title": f"Review LangGraph State Machine Patterns for {target_role}",
                "description": "Deep dive into conditional branching, checkpointing, and human-in-the-loop interruption primitives.",
                "priority": "high",
                "estimated_minutes": 60,
                "status": "pending"
            },
            {
                "id": "task_2",
                "title": f"Practice Weaviate Cloud v4 Hybrid Retrieval Architecture",
                "description": "Review dense + sparse search, distance metrics, and multi-tenant tenant isolation filters.",
                "priority": "high",
                "estimated_minutes": 60,
                "status": "pending"
            },
            {
                "id": "task_3",
                "title": f"STAR Mock Scenario Preparation for {target_role}",
                "description": "Formulate structured behavioral examples demonstrating technical leadership and conflict resolution.",
                "priority": "medium",
                "estimated_minutes": 45,
                "status": "pending"
            }
        ]
        return tasks

    async def execute_step(self, state: LifeForgeState, step: PlanStep) -> Dict[str, Any]:
        # 1. Query calendar availability for target dates
        now = datetime.now(timezone.utc)
        target_start = (now + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)
        target_end = target_start + timedelta(hours=4)

        avail_res = await tool_registry.execute_tool(
            agent_name="planning",
            tool_name="calendar_availability",
            user_id=state.user_id,
            parameters={
                "start_date": target_start.isoformat(),
                "end_date": target_end.isoformat(),
                "duration_minutes": 60
            }
        )

        available_slots = []
        if avail_res.status == "success" and avail_res.data:
            available_slots = avail_res.data.get("available_slots", [])

        # 2. Formulate schedule and curriculum via LLM
        prior_interview = state.agent_outputs.get("generate_questions", {}).get("interview_intelligence", {})
        gaps = prior_interview.get("skill_gaps", ["LangGraph architectures", "Weaviate retrieval"])

        prompt = (
            f"You are the Strategic Planning and Scheduling Agent for LifeForge.\n"
            f"Goal: {state.goal}\n"
            f"Step: {step.description}\n"
            f"Priorities & Gaps to address: {gaps}\n"
            f"Available Calendar Window: {target_start.strftime('%A, %B %d at %I:%M %p')}\n\n"
            "Formulate a concrete schedule of 3 actionable preparation sessions:\n"
            "Each session must have title, focus, duration (minutes), and specific scheduled time.\n"
            "Return valid JSON:\n"
            "{\n"
            "  \"sessions\": [\n"
            "    {\"title\": \"...\", \"focus\": \"...\", \"duration_minutes\": 60, \"recommended_start\": \"" + target_start.isoformat() + "\"}\n"
            "  ],\n"
            "  \"tasks_to_create\": [\n"
            "    {\"title\": \"...\", \"priority\": \"high\", \"estimated_minutes\": 45}\n"
            "  ]\n"
            "}"
        )

        resp = await self.provider.generate(prompt=prompt, temperature=0.1)
        try:
            plan_data = json.loads(resp.content)
        except Exception:
            plan_data = {
                "sessions": [
                    {
                        "title": "Interview Prep: LangGraph Architecture & Cyclic Flows",
                        "focus": "Deep dive into state graphs, checkpointing, and interrupt approval flows.",
                        "duration_minutes": 60,
                        "recommended_start": target_start.isoformat()
                    },
                    {
                        "title": "Interview Prep: Weaviate Multi-Tenant RAG & Embeddings",
                        "focus": "Review vector filtering, cosine distance metrics, and hybrid search.",
                        "duration_minutes": 60,
                        "recommended_start": (target_start + timedelta(days=1)).isoformat()
                    }
                ],
                "tasks_to_create": [
                    {"title": "Review LangGraph Checkpointer Documentation", "priority": "high", "estimated_minutes": 45},
                    {"title": "Implement Mock Technical Interview Questions", "priority": "medium", "estimated_minutes": 60}
                ]
            }

        # 3. Deterministically persist tasks into database
        created_task_ids = []
        for task_spec in plan_data.get("tasks_to_create", []):
            task_res = await tool_registry.execute_tool(
                agent_name="planning",
                tool_name="task_create",
                user_id=state.user_id,
                parameters={
                    "title": task_spec["title"],
                    "priority": task_spec.get("priority", "medium"),
                    "estimated_duration_minutes": task_spec.get("estimated_minutes", 45),
                    "due_date": (now + timedelta(days=3)).isoformat()
                }
            )
            if task_res.status == "success" and task_res.data:
                created_task_ids.append(task_res.data.get("task_id"))

        # 4. If step requires external mutation, flag approval request for the sensitive action
        approval_item = None
        if step.requires_approval and plan_data.get("sessions"):
            session_0 = plan_data["sessions"][0]
            start_iso = session_0["recommended_start"]
            end_iso = (datetime.fromisoformat(start_iso) + timedelta(minutes=session_0["duration_minutes"])).isoformat()

            cal_tool_res = await tool_registry.execute_tool(
                agent_name="planning",
                tool_name="calendar_create_event",
                user_id=state.user_id,
                parameters={
                    "title": session_0["title"],
                    "description": session_0["focus"],
                    "start_time": start_iso,
                    "end_time": end_iso,
                    "__human_approved__": False  # Triggers requires_approval
                }
            )
            if cal_tool_res.status == "requires_approval":
                approval_item = ApprovalRequest(
                    id=f"approval_{step.id}",
                    action_type="calendar_create",
                    title=f"Schedule '{session_0['title']}'",
                    description=f"Create Google Calendar session on {datetime.fromisoformat(start_iso).strftime('%b %d, %Y at %I:%M %p')}",
                    payload=cal_tool_res.approval_payload.get("payload", {}) if cal_tool_res.approval_payload else {}
                )
                state.pending_approvals.append(approval_item)

        return {
            "step_id": step.id,
            "agent": "planning",
            "schedule": plan_data,
            "created_task_count": len(created_task_ids),
            "requires_human_approval": approval_item is not None,
            "status": "awaiting_approval" if approval_item else "completed"
        }


planning_agent = PlanningAgent()
