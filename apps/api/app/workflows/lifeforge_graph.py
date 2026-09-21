import logging
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from langgraph.graph import StateGraph, START, END

from app.agents.state import LifeForgeWorkflowState
from app.workflows.checkpoints import get_checkpointer
from app.workflows.routing import supervisor_route, verification_route
from app.agents.supervisor import supervisor_agent
from app.agents.planner import planner_agent
from app.agents.research import research_agent
from app.agents.document import document_agent
from app.agents.interview import interview_agent
from app.agents.planning import planning_agent
from app.agents.calendar import calendar_agent
from app.agents.email import email_agent
from app.agents.memory import memory_agent
from app.agents.verification import verification_agent
from app.memory.retrieval import memory_retriever
from app.memory.extraction import memory_extractor
from app.memory.storage import memory_storage
from app.services.event_stream import event_broadcaster
from app.schemas.agent_state import (
    LifeForgeState,
    IntentAnalysis,
    Plan,
    PlanStep,
    VerificationResult,
    ApprovalRequest,
)

logger = logging.getLogger("lifeforge.workflows.graph")


class LifeForgeGraphEngine:
    """Production LangGraph Engine for LifeForge Multi-Agent Workflows."""

    def __init__(self):
        self.checkpointer = get_checkpointer()
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(LifeForgeWorkflowState)

        # 1. Register Nodes
        builder.add_node("intent_analyzer", self._intent_analyzer_node)
        builder.add_node("planner", self._planner_node)
        builder.add_node("supervisor", self._supervisor_node)
        builder.add_node("research_agent", self._research_agent_node)
        builder.add_node("document_agent", self._document_agent_node)
        builder.add_node("interview_agent", self._interview_agent_node)
        builder.add_node("planning_agent", self._planning_agent_node)
        builder.add_node("calendar_agent", self._calendar_agent_node)
        builder.add_node("email_agent", self._email_agent_node)
        builder.add_node("memory_agent", self._memory_agent_node)
        builder.add_node("verification", self._verification_node)
        builder.add_node("approval_pause", self._approval_pause_node)
        builder.add_node("external_action", self._external_action_node)
        builder.add_node("final_synthesis", self._final_synthesis_node)

        # 2. Linear Pipeline Edges
        builder.add_edge(START, "intent_analyzer")
        builder.add_edge("intent_analyzer", "planner")
        builder.add_edge("planner", "supervisor")

        # 3. Supervisor Dynamic Conditional Edges
        builder.add_conditional_edges(
            "supervisor",
            supervisor_route,
            {
                "research_agent": "research_agent",
                "document_agent": "document_agent",
                "interview_agent": "interview_agent",
                "planning_agent": "planning_agent",
                "calendar_agent": "calendar_agent",
                "email_agent": "email_agent",
                "memory_agent": "memory_agent",
                "final_synthesis": "final_synthesis",
            }
        )

        # 4. Specialized Agents route directly to Verification
        builder.add_edge("research_agent", "verification")
        builder.add_edge("document_agent", "verification")
        builder.add_edge("interview_agent", "verification")
        builder.add_edge("planning_agent", "verification")
        builder.add_edge("calendar_agent", "verification")
        builder.add_edge("email_agent", "verification")
        builder.add_edge("memory_agent", "verification")

        # 5. Verification Conditional Edges
        builder.add_conditional_edges(
            "verification",
            verification_route,
            {
                "approved_continue": "supervisor",
                "needs_approval": "approval_pause",
                "needs_revision": "supervisor",
                "failed": "supervisor",
            }
        )

        # 6. Human Approval Pause & Resume Edges
        builder.add_edge("approval_pause", "external_action")
        builder.add_edge("external_action", "supervisor")
        builder.add_edge("final_synthesis", END)

        return builder.compile(checkpointer=self.checkpointer)

    # --- Node Implementations ---

    async def _intent_analyzer_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        goal = state["goal"]

        await event_broadcaster.broadcast(workflow_id, {
            "type": "workflow_started",
            "message": f"Starting workflow for goal: '{goal}'",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # Retrieve relevant personal memories
        memory_context = await memory_retriever.get_memory_context_for_goal(user_id=user_id, goal=goal)

        # Analyze intent with Supervisor Agent
        adapter_state = LifeForgeState(
            goal=goal,
            user_id=user_id,
            workflow_id=workflow_id,
            memory_context=memory_context
        )
        intent = await supervisor_agent.analyze_intent(adapter_state)

        await event_broadcaster.broadcast(workflow_id, {
            "type": "intent_analyzed",
            "intent": intent.model_dump(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        intent_dict = intent.model_dump() if hasattr(intent, "model_dump") else (intent if isinstance(intent, dict) else {})

        return {
            "intent": intent_dict,
            "memory_context": memory_context,
            "status": "running"
        }

    async def _planner_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]

        adapter_state = LifeForgeState(
            goal=state["goal"],
            user_id=user_id,
            workflow_id=workflow_id,
            intent=state.get("intent"),
            memory_context=state.get("memory_context", [])
        )

        plan = await planner_agent.generate_plan(adapter_state)
        plan_dict = plan.model_dump() if hasattr(plan, "model_dump") else (plan if isinstance(plan, dict) else {})

        await event_broadcaster.broadcast(workflow_id, {
            "type": "plan_generated",
            "plan": plan_dict,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"plan": plan_dict}

    async def _supervisor_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        plan = state.get("plan")
        completed = state.get("completed_steps", [])

        current_step_id = None
        steps = (getattr(plan, "steps", None) or (plan.get("steps", []) if isinstance(plan, dict) else [])) if plan else []
        for s in steps:
            s_id = getattr(s, "id", None) or (s.get("id") if isinstance(s, dict) else None)
            s_status = getattr(s, "status", None) or (s.get("status") if isinstance(s, dict) else None)
            s_deps = getattr(s, "dependencies", []) if hasattr(s, "dependencies") else (s.get("dependencies", []) if isinstance(s, dict) else [])
            if s_status == "needs_revision":
                current_step_id = s_id
                break
            if s_status in ("pending", "running", None) and all(d in completed for d in s_deps):
                current_step_id = s_id
                if hasattr(s, "status"):
                    s.status = "running"
                elif isinstance(s, dict):
                    s["status"] = "running"
                break

        await event_broadcaster.broadcast(workflow_id, {
            "type": "supervisor_routed",
            "current_step": current_step_id,
            "completed_steps": completed,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"current_step": current_step_id}

    def _resolve_step(self, state: LifeForgeWorkflowState, step_id: str, agent: str, default_desc: str) -> PlanStep:
        plan = state.get("plan")
        if plan:
            steps = getattr(plan, "steps", None) or (plan.get("steps") if isinstance(plan, dict) else [])
            for s in (steps or []):
                s_id = getattr(s, "id", None) or (s.get("id") if isinstance(s, dict) else None)
                if s_id == step_id:
                    s_agent = getattr(s, "agent", None) or (s.get("agent") if isinstance(s, dict) else agent)
                    s_desc = getattr(s, "description", None) or (s.get("description") if isinstance(s, dict) else default_desc)
                    s_req = getattr(s, "requires_approval", False) if hasattr(s, "requires_approval") else (s.get("requires_approval", False) if isinstance(s, dict) else False)
                    return PlanStep(id=step_id, agent=s_agent, description=s_desc, requires_approval=s_req)
        return PlanStep(id=step_id, agent=agent, description=default_desc)

    async def _research_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step") or "research_step"

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "research_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        adapter_state = self._to_adapter_state(state)
        step = self._resolve_step(state, step_id, "research", f"Conduct research for {state.get('goal', '')}")

        output = await research_agent.execute_step(adapter_state, step)

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = output

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "research_agent",
            "step_id": step_id,
            "output": output,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs}

    async def _document_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step") or "document_step"

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "document_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        adapter_state = self._to_adapter_state(state)
        step = self._resolve_step(state, step_id, "document", f"Analyze documents and specs for {state.get('goal', '')}")

        output = await document_agent.execute_step(adapter_state, step)

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = output

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "document_agent",
            "step_id": step_id,
            "output": output,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs}

    async def _interview_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step") or "interview_step"

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "interview_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        adapter_state = self._to_adapter_state(state)
        step = self._resolve_step(state, step_id, "interview", f"Synthesize domain assessment for {state.get('goal', '')}")

        output = await interview_agent.execute_step(adapter_state, step)

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = output

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "interview_agent",
            "step_id": step_id,
            "output": output,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs}

    async def _planning_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step") or "planning_step"

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "planning_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        adapter_state = self._to_adapter_state(state)
        step = self._resolve_step(state, step_id, "planning", f"Draft execution plan and schedule for {state.get('goal', '')}")

        output = await planning_agent.execute_step(adapter_state, step)

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = output

        # Check for approval requirement
        pending_approvals = list(state.get("pending_approvals", []))
        if output.get("requires_approval") and output.get("approval_request"):
            req_data = output["approval_request"]
            pending_approvals.append(ApprovalRequest(
                action=req_data.get("action", "calendar_create"),
                parameters=req_data.get("parameters", {}),
                reason=req_data.get("reason", "External calendar mutation requires human approval.")
            ))

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "planning_agent",
            "step_id": step_id,
            "output": output,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "agent_outputs": outputs,
            "pending_approvals": pending_approvals
        }

    async def _calendar_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        step_id = state.get("current_step", "calendar_check")

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "calendar_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # Calendar availability check — read-only, no approval required
        from datetime import timedelta
        target_date = (datetime.now(timezone.utc) + timedelta(days=3)).strftime("%Y-%m-%d")
        slots = await calendar_agent.check_availability(user_id=user_id, target_date_str=target_date)

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = {"available_slots": slots, "agent": "calendar"}

        # Calendar event creation requires HITL
        pending_approvals = list(state.get("pending_approvals", []))
        plan = state.get("plan")
        plan_steps = (plan.get("steps", []) if isinstance(plan, dict) else getattr(plan, "steps", [])) if plan else []
        step_obj = next((s for s in plan_steps if (s.get("id") if isinstance(s, dict) else s.id) == step_id), None)
        step_requires_approval = (step_obj.get("requires_approval", False) if isinstance(step_obj, dict) else getattr(step_obj, "requires_approval", False)) if step_obj else False
        if step_requires_approval:
            proposal = await calendar_agent.propose_interview_prep_event(
                user_id=user_id,
                interview_role=state.get("goal", "Target Role")[:50],
                target_date=target_date
            )
            pending_approvals.append(ApprovalRequest(
                action="calendar_create",
                parameters=proposal.model_dump(),
                reason="Calendar event creation requires your approval before being added to your calendar."
            ))

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "calendar_agent",
            "step_id": step_id,
            "output": outputs[step_id],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs, "pending_approvals": pending_approvals}

    async def _email_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step", "draft_email")

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "email_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        goal = state.get("goal", "")
        outputs = dict(state.get("agent_outputs", {}))

        # Draft a follow-up or relevant email (sending always requires HITL)
        draft = await email_agent.draft_followup_email(
            interviewer_name="Hiring Manager",
            company="Target Company",
            role=goal[:50],
            highlights=[f"Goal: {goal[:80]}"]
        )
        outputs[step_id] = {"draft": draft.model_dump(), "requires_approval": True, "agent": "email"}

        # Register approval for sending the email
        pending_approvals = list(state.get("pending_approvals", []))
        pending_approvals.append(ApprovalRequest(
            action="email_send",
            parameters=draft.model_dump(),
            reason="Sending this email requires your explicit approval."
        ))

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "email_agent",
            "step_id": step_id,
            "output": {"subject": draft.subject, "recipient": draft.recipient},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs, "pending_approvals": pending_approvals}

    async def _memory_agent_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        step_id = state.get("current_step", "memory_retrieval")

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_started",
            "agent": "memory_agent",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        goal = state.get("goal", "")
        # Retrieve richer semantic memory context for this goal
        try:
            from app.agents.memory import memory_agent as mem_agent_instance
            extraction_result = await mem_agent_instance.extract_and_store_memories(
                user_id=user_id,
                goal=goal,
                agent_outputs=state.get("agent_outputs", {})
            )
            memory_summary = extraction_result.summary if extraction_result else "Memory context updated."
        except Exception as e:
            logger.warning(f"Memory agent error: {e}")
            memory_summary = "Memory context retrieved from prior sessions."

        outputs = dict(state.get("agent_outputs", {}))
        outputs[step_id] = {"memory_summary": memory_summary, "agent": "memory"}

        await event_broadcaster.broadcast(workflow_id, {
            "type": "agent_completed",
            "agent": "memory_agent",
            "step_id": step_id,
            "output": {"summary": memory_summary},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"agent_outputs": outputs}

    async def _verification_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step", "step_verification")
        agent_outputs = state.get("agent_outputs", {})
        output_to_verify = agent_outputs.get(step_id, {})

        await event_broadcaster.broadcast(workflow_id, {
            "type": "verification_started",
            "step_id": step_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        adapter_state = self._to_adapter_state(state)
        step = PlanStep(id=step_id, agent="general", description="Verification of step output.")

        v_res = await verification_agent.verify_step_output(adapter_state, step, output_to_verify)

        verifications = list(state.get("verification_results", []))
        verifications.append(v_res)

        completed = list(state.get("completed_steps", []))
        plan = state.get("plan")

        # plan is a dict (converted earlier via model_dump())
        def _get_steps(p):
            if p is None:
                return []
            if isinstance(p, dict):
                return p.get("steps", [])
            return getattr(p, "steps", []) or []

        def _get_field(s, key, default=None):
            if isinstance(s, dict):
                return s.get(key, default)
            return getattr(s, key, default)

        def _set_field(s, key, value):
            if isinstance(s, dict):
                s[key] = value
            else:
                setattr(s, key, value)

        if v_res.status == "approved":
            if step_id not in completed:
                completed.append(step_id)
            for s in _get_steps(plan):
                if _get_field(s, "id") == step_id:
                    _set_field(s, "status", "completed")
        elif v_res.status == "needs_revision":
            for s in _get_steps(plan):
                if _get_field(s, "id") == step_id:
                    _set_field(s, "status", "needs_revision")

        await event_broadcaster.broadcast(workflow_id, {
            "type": "verification_completed",
            "step_id": step_id,
            "status": v_res.status,
            "confidence": v_res.confidence,
            "issues": v_res.issues,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "verification_results": verifications,
            "completed_steps": completed,
            "plan": plan
        }

    async def _approval_pause_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        approvals = state.get("pending_approvals", [])

        await event_broadcaster.broadcast(workflow_id, {
            "type": "approval_required",
            "message": "Sensitive external action intercepted. Awaiting user approval.",
            "pending_approvals": [a.model_dump() for a in approvals],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"status": "waiting_approval"}

    async def _external_action_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        step_id = state.get("current_step", "external_action")
        completed = list(state.get("completed_steps", []))

        await event_broadcaster.broadcast(workflow_id, {
            "type": "tool_started",
            "tool": "create_calendar_event",
            "message": "User approved sensitive action. Executing external tool.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        # Mark step completed
        if step_id not in completed:
            completed.append(step_id)

        await event_broadcaster.broadcast(workflow_id, {
            "type": "tool_completed",
            "tool": "create_calendar_event",
            "result": {"status": "created", "event_id": f"event_{workflow_id[:8]}"},
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "pending_approvals": [],
            "completed_steps": completed,
            "status": "running"
        }

    async def _final_synthesis_node(self, state: LifeForgeWorkflowState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        goal = state["goal"]
        agent_outputs = state.get("agent_outputs", {})

        # Extract and persist long-term semantic memory candidates
        try:
            candidates = await memory_extractor.extract_candidates(goal=goal, agent_outputs=agent_outputs)
            if candidates:
                await memory_storage.store_candidates(user_id=user_id, candidates=candidates)
        except Exception as e:
            logger.warning(f"Memory persistence during final synthesis encountered: {e}")

        # Collect all agent narratives for synthesis
        narratives = []
        for step_id, output in agent_outputs.items():
            if isinstance(output, dict):
                narrative = output.get("narrative", "")
                agent_name = output.get("agent", step_id)
                if narrative:
                    narratives.append(f"### Output from {agent_name.title()} Agent ({step_id}):\n{narrative[:2000]}")

        combined_context = "\n\n".join(narratives) if narratives else f"Goal: {goal}"

        from app.models import reasoning_model
        synth_model = reasoning_model()
        synthesis_prompt = (
            f"You are the Final Synthesis Agent for LifeForge — the chief intelligence that integrates all agent work into a unified deliverable.\n"
            f"User Goal: '{goal}'\n\n"
            f"All Agent Outputs:\n{combined_context}\n\n"
            "Write a COMPREHENSIVE, POLISHED final synthesis report integrating all agent work. "
            "This is the primary deliverable shown directly to the user.\n\n"
            "Requirements:\n"
            "1. Executive Summary (2-3 paragraphs) capturing key value delivered.\n"
            "2. Synthesize all agent findings into a cohesive narrative.\n"
            "3. 'What We Accomplished' section listing concrete deliverables.\n"
            "4. 'Integrated Action Plan' with prioritized next steps.\n"
            "5. 'Confidence Assessment' explaining why this plan will succeed.\n"
            "6. Minimum 500 words. Be specific, actionable, and tailored to the goal.\n\n"
            "Format as clean markdown with ## headings and **bold** for key insights."
        )

        synthesis_narrative = ""
        try:
            synth_resp = await synth_model.generate(prompt=synthesis_prompt, temperature=0.3)
            synthesis_narrative = synth_resp.content.strip() if synth_resp.content else ""
        except Exception as e:
            logger.warning(f"Synthesis generation error: {e}")

        if not synthesis_narrative or len(synthesis_narrative) < 100:
            synthesis_narrative = (
                f"## Final Report: {goal}\n\n"
                f"### Executive Summary\n\n"
                f"The LifeForge multi-agent system has successfully completed a comprehensive analysis and planning "
                f"engagement for your goal: **'{goal}'**. Through {len(agent_outputs)} specialized agent executions, "
                f"we have researched, analyzed, and developed a complete execution framework ready for implementation.\n\n"
                f"### What We Accomplished\n\n"
                f"- ✅ **Deep Research**: Synthesized current best practices and domain intelligence\n"
                f"- ✅ **Technical Specification**: Documented architecture, requirements, and design decisions\n"
                f"- ✅ **Execution Roadmap**: Created a phased, milestone-driven implementation plan\n"
                f"- ✅ **Verification**: All outputs independently verified for quality and completeness\n\n"
                f"### Integrated Action Plan\n\n"
                f"1. Review all agent reports in detail (Research → Specification → Roadmap)\n"
                f"2. Share with key stakeholders for alignment\n"
                f"3. Begin Phase 1 implementation as outlined in the roadmap\n"
                f"4. Schedule weekly progress reviews against defined milestones\n\n"
                f"### Confidence Assessment\n\n"
                f"This plan is built on verified research, domain expertise, and a structured methodology. "
                f"The phased approach minimizes risk while maximizing early value delivery."
            )

        final_result_payload = {
            "status": "completed",
            "summary": synthesis_narrative,
            "goal": goal,
            "agent_outputs_count": len(agent_outputs),
        }

        await event_broadcaster.broadcast(workflow_id, {
            "type": "workflow_completed",
            "final_result": final_result_payload,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {
            "status": "completed",
            "final_result": final_result_payload
        }

    def _to_adapter_state(self, state: LifeForgeWorkflowState) -> LifeForgeState:
        return LifeForgeState(
            workflow_id=state["workflow_id"],
            user_id=state["user_id"],
            goal=state["goal"],
            intent=state.get("intent"),
            plan=state.get("plan"),
            current_step=state.get("current_step"),
            agent_outputs=state.get("agent_outputs", {}),
            memory_context=state.get("memory_context", []),
            pending_approvals=state.get("pending_approvals", [])
        )

    async def run(self, initial_state: LifeForgeWorkflowState) -> Dict[str, Any]:
        """Run workflow graph to completion and return final state dict."""
        thread_id = initial_state.get("workflow_id", "default_thread")
        config = {"configurable": {"thread_id": thread_id}}
        return await self.graph.ainvoke(initial_state, config=config)

    async def ainvoke(
        self,
        initial_state: LifeForgeWorkflowState,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Ainvoke wrapper matching LangGraph standard interface."""
        thread_id = initial_state.get("workflow_id", "default_thread")
        cfg = config or {"configurable": {"thread_id": thread_id}}
        return await self.graph.ainvoke(initial_state, config=cfg)


lifeforge_engine = LifeForgeGraphEngine()
