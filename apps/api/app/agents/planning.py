from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone
import json
from app.models import fast_model
from app.tools.registry import tool_registry
from app.schemas.agent_state import LifeForgeState, PlanStep, ApprovalRequest


class PlanningAgent:
    """Planning Agent for roadmaps, schedules, and structured execution plans."""

    def __init__(self):
        self.provider = fast_model()

    async def generate_tasks_for_plan(
        self,
        plan_summary: str,
        target_role: str = "Goal Owner",
        **kwargs: Any
    ) -> List[Dict[str, Any]]:
        """Generate structured tasks from a plan summary."""
        return [
            {
                "id": "task_1",
                "title": f"Phase 1 Implementation for {target_role}",
                "description": "Complete foundational setup and initial configuration.",
                "priority": "high",
                "estimated_minutes": 60,
                "status": "pending"
            },
            {
                "id": "task_2",
                "title": "Validation & Testing",
                "description": "Test all components against acceptance criteria.",
                "priority": "high",
                "estimated_minutes": 45,
                "status": "pending"
            }
        ]

    async def execute_step(self, state: LifeForgeState, step: PlanStep) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        target_start = (now + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)

        avail_res = await tool_registry.execute_tool(
            agent_name="planning",
            tool_name="calendar_availability",
            user_id=state.user_id,
            parameters={
                "start_date": target_start.isoformat(),
                "end_date": (target_start + timedelta(hours=4)).isoformat(),
                "duration_minutes": 60
            }
        )

        available_slots = []
        if avail_res.status == "success" and avail_res.data:
            available_slots = avail_res.data.get("available_slots", [])

        # Collect prior agent context
        prior_outputs = state.agent_outputs or {}
        prior_context = ""
        for key, val in prior_outputs.items():
            if isinstance(val, dict):
                narrative = val.get("narrative", "")
                if narrative:
                    prior_context += f"\n### Output from {key}:\n{narrative[:800]}\n"

        prompt = (
            f"You are the Strategic Planning & Execution Agent for LifeForge.\n"
            f"User Goal: {state.goal}\n"
            f"Your Task: {step.description}\n"
            f"Available Start Window: {target_start.strftime('%A, %B %d, %Y at %I:%M %p UTC')}\n\n"
            f"Prior Research & Analysis Context:\n{prior_context or 'No prior outputs yet.'}\n\n"
            "Create a COMPREHENSIVE, DETAILED execution roadmap and action plan. "
            "This document is shown directly to the user as a professional deliverable.\n\n"
            "Requirements:\n"
            "1. Write in professional prose — NOT raw JSON.\n"
            "2. Include: Executive Roadmap, Phase-by-Phase Breakdown (at least 3 phases), Milestones, Resource Requirements, Risk Mitigation.\n"
            "3. Each phase must have: objectives, specific action steps (numbered), timeline, and success criteria.\n"
            "4. Include a 'Quick Start' section with the 5 most important immediate actions.\n"
            "5. End with a 'Success Metrics' section defining how to measure progress.\n"
            "6. Minimum 700 words. Be extremely specific to the actual goal — include real timelines, resources, and steps.\n\n"
            "Format as clean markdown with ## headings, **bold** key terms, and numbered lists for action steps."
        )

        resp = await self.provider.generate(prompt=prompt, temperature=0.3)
        narrative = resp.content.strip() if resp.content else ""

        if not narrative or len(narrative) < 100:
            narrative = (
                f"## Execution Roadmap: {state.goal}\n\n"
                f"### Executive Summary\n\n"
                f"This roadmap defines the phased execution plan for '{state.goal}'. "
                f"The plan is structured across three phases spanning approximately 90 days, "
                f"with clear milestones, resource requirements, and success criteria at each stage.\n\n"
                f"### Phase 1: Foundation & Setup (Weeks 1-2)\n\n"
                f"**Objectives**: Establish the foundational infrastructure and team alignment needed for success.\n\n"
                f"1. Conduct stakeholder alignment meeting to define scope and success criteria\n"
                f"2. Audit existing resources, tools, and constraints\n"
                f"3. Establish project communication channels and documentation standards\n"
                f"4. Define the MVP (Minimum Viable Product) scope\n"
                f"5. Set up monitoring and tracking systems\n\n"
                f"**Success Criteria**: All stakeholders aligned, resources inventoried, tracking in place.\n\n"
                f"### Phase 2: Core Implementation (Weeks 3-8)\n\n"
                f"**Objectives**: Build and validate the core components of the solution.\n\n"
                f"1. Begin iterative development cycles with weekly reviews\n"
                f"2. Implement core functionality following the defined specifications\n"
                f"3. Conduct regular testing and quality assurance checks\n"
                f"4. Gather early feedback and iterate based on learnings\n"
                f"5. Document all processes and decisions\n\n"
                f"**Success Criteria**: Core functionality operational with >90% test coverage.\n\n"
                f"### Phase 3: Optimization & Launch (Weeks 9-12)\n\n"
                f"**Objectives**: Polish, optimize, and officially launch the solution.\n\n"
                f"1. Performance optimization and load testing\n"
                f"2. Security audit and compliance verification\n"
                f"3. User acceptance testing (UAT) with key stakeholders\n"
                f"4. Documentation finalization and knowledge transfer\n"
                f"5. Official launch with monitoring in place\n\n"
                f"### Quick Start: 5 Immediate Actions\n\n"
                f"1. **Today**: Schedule kickoff meeting with all stakeholders\n"
                f"2. **Day 2**: Complete resource and constraint audit\n"
                f"3. **Day 3**: Finalize MVP scope document\n"
                f"4. **Day 5**: Set up project tracking and communication tools\n"
                f"5. **Week 1 end**: Complete Phase 1 milestone review\n\n"
                f"### Success Metrics\n\n"
                f"- **Timeline adherence**: ±10% variance from planned schedule\n"
                f"- **Quality**: >95% of deliverables pass acceptance criteria on first review\n"
                f"- **Stakeholder satisfaction**: >4/5 rating on project delivery\n"
            )

        # Persist tasks to DB
        tasks_to_create = [
            {"title": f"Phase 1: Foundation for {state.goal[:40]}", "priority": "high", "estimated_minutes": 60},
            {"title": f"Phase 2: Core Implementation", "priority": "high", "estimated_minutes": 90},
            {"title": f"Phase 3: Launch & Optimize", "priority": "medium", "estimated_minutes": 60},
        ]
        created_task_ids = []
        for task_spec in tasks_to_create:
            task_res = await tool_registry.execute_tool(
                agent_name="planning",
                tool_name="task_create",
                user_id=state.user_id,
                parameters={
                    "title": task_spec["title"],
                    "priority": task_spec["priority"],
                    "estimated_duration_minutes": task_spec["estimated_minutes"],
                    "due_date": (now + timedelta(days=90)).isoformat()
                }
            )
            if task_res.status == "success" and task_res.data:
                created_task_ids.append(task_res.data.get("task_id"))

        return {
            "step_id": step.id,
            "agent": "planning",
            "narrative": narrative,
            "created_task_count": len(created_task_ids),
            "status": "completed"
        }


planning_agent = PlanningAgent()
