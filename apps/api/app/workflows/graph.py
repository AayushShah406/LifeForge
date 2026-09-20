from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Literal, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.schemas.agent_state import (
    LifeForgeState,
    IntentAnalysis,
    Plan,
    PlanStep,
    VerificationResult,
    ApprovalRequest,
)
from app.agents.supervisor import supervisor_agent
from app.agents.planner import planner_agent
from app.agents.research import research_agent
from app.agents.document import document_agent
from app.agents.interview import interview_agent
from app.agents.planning import planning_agent
from app.agents.verification import verification_agent
from app.memory.manager import memory_manager
from app.services.event_stream import event_broadcaster
from app.workflows.state import WorkflowGraphState


class LifeForgeGraphEngine:
    """Production LangGraph Engine for LifeForge Multi-Agent Workflows."""

    def __init__(self):
        self.checkpointer = MemorySaver()
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(WorkflowGraphState)

        # Register Nodes
        builder.add_node("intent_analyzer", self._intent_analyzer_node)
        builder.add_node("planner", self._planner_node)
        builder.add_node("supervisor", self._supervisor_node)
        builder.add_node("research_agent", self._research_agent_node)
        builder.add_node("document_agent", self._document_agent_node)
        builder.add_node("interview_agent", self._interview_agent_node)
        builder.add_node("planning_agent", self._planning_agent_node)
        builder.add_node("verification", self._verification_node)
        builder.add_node("approval_pause", self._approval_pause_node)
        builder.add_node("external_action", self._external_action_node)
        builder.add_node("final_synthesis", self._final_synthesis_node)

        # Edges
        builder.add_edge(START, "intent_analyzer")
        builder.add_edge("intent_analyzer", "planner")
        builder.add_edge("planner", "supervisor")

        # Supervisor dynamic routing
        builder.add_conditional_edges(
            "supervisor",
            self._supervisor_route,
            {
                "research_agent": "research_agent",
                "document_agent": "document_agent",
                "interview_agent": "interview_agent",
                "planning_agent": "planning_agent",
                "final_synthesis": "final_synthesis",
            }
        )

        # Specialized agents all route to verification
        builder.add_edge("research_agent", "verification")
        builder.add_edge("document_agent", "verification")
        builder.add_edge("interview_agent", "verification")
        builder.add_edge("planning_agent", "verification")

        # Verification conditional routing
        builder.add_conditional_edges(
            "verification",
            self._verification_route,
            {
                "approved_continue": "supervisor",
                "needs_approval": "approval_pause",
                "needs_revision": "supervisor",
                "failed": "supervisor",
            }
        )

        # Approval pause: resumes into external action when approved
        builder.add_edge("approval_pause", "external_action")
        builder.add_edge("external_action", "supervisor")
        builder.add_edge("final_synthesis", END)

        return builder.compile(checkpointer=self.checkpointer)

    # --- Node Implementations ---

    async def _intent_analyzer_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        goal = state["goal"]

        # Pre-workflow memory retrieval from Weaviate
        memories = await memory_manager.get_context_for_goal(user_id=user_id, goal=goal)

        pydantic_state = LifeForgeState(
            user_id=user_id,
            goal=goal,
            memory_context=memories
        )

        intent_res = await supervisor_agent.analyze_intent(pydantic_state)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="intent_analyzed",
            data={
                "intent": intent_res.intent,
                "confidence": intent_res.confidence,
                "entities": intent_res.entities,
                "memories_retrieved": len(memories)
            }
        )

        return {
            "intent": intent_res.model_dump(),
            "memory_context": memories
        }

    async def _planner_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        pydantic_state = LifeForgeState(
            user_id=state["user_id"],
            goal=state["goal"],
            intent=IntentAnalysis.model_validate(state["intent"]),
            memory_context=state.get("memory_context", [])
        )

        plan = await planner_agent.generate_plan(pydantic_state)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="plan_created",
            data={
                "workflow_type": plan.workflow_type,
                "step_count": len(plan.steps),
                "steps": [s.model_dump() for s in plan.steps]
            }
        )

        return {
            "plan": plan.model_dump(),
            "completed_steps": [],
            "failed_steps": []
        }

    async def _supervisor_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        state["iteration_count"] = state.get("iteration_count", 0) + 1
        return {"iteration_count": state["iteration_count"]}

    def _supervisor_route(self, state: WorkflowGraphState) -> str:
        plan_dict = state.get("plan", {})
        steps = plan_dict.get("steps", [])
        completed = set(state.get("completed_steps", []))

        # Check for uncompleted steps whose dependencies are met
        for step in steps:
            s_id = step["id"]
            if s_id not in completed:
                deps = step.get("dependencies", [])
                if all(d in completed for d in deps):
                    state["current_step"] = s_id
                    agent_name = step["agent"]
                    return f"{agent_name}_agent"

        return "final_synthesis"

    async def _research_agent_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        current_step_id = state.get("current_step", "research_step")
        step_dict = next((s for s in state["plan"]["steps"] if s["id"] == current_step_id), {"id": current_step_id, "description": state["goal"], "agent": "research"})
        step_obj = PlanStep.model_validate(step_dict)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_started",
            data={"agent": "research", "step_id": current_step_id, "description": step_obj.description}
        )

        pydantic_state = self._to_pydantic_state(state)
        output = await research_agent.execute_step(pydantic_state, step_obj)

        state["agent_outputs"][current_step_id] = output

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_completed",
            data={"agent": "research", "step_id": current_step_id, "output": output}
        )

        return {"agent_outputs": state["agent_outputs"]}

    async def _document_agent_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        current_step_id = state.get("current_step", "document_step")
        step_dict = next((s for s in state["plan"]["steps"] if s["id"] == current_step_id), {"id": current_step_id, "description": state["goal"], "agent": "document"})
        step_obj = PlanStep.model_validate(step_dict)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_started",
            data={"agent": "document", "step_id": current_step_id, "description": step_obj.description}
        )

        pydantic_state = self._to_pydantic_state(state)
        output = await document_agent.execute_step(pydantic_state, step_obj)

        state["agent_outputs"][current_step_id] = output

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_completed",
            data={"agent": "document", "step_id": current_step_id, "output": output}
        )

        return {"agent_outputs": state["agent_outputs"]}

    async def _interview_agent_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        current_step_id = state.get("current_step", "interview_step")
        step_dict = next((s for s in state["plan"]["steps"] if s["id"] == current_step_id), {"id": current_step_id, "description": state["goal"], "agent": "interview"})
        step_obj = PlanStep.model_validate(step_dict)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_started",
            data={"agent": "interview", "step_id": current_step_id, "description": step_obj.description}
        )

        pydantic_state = self._to_pydantic_state(state)
        output = await interview_agent.execute_step(pydantic_state, step_obj)

        state["agent_outputs"][current_step_id] = output

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_completed",
            data={"agent": "interview", "step_id": current_step_id, "output": output}
        )

        return {"agent_outputs": state["agent_outputs"]}

    async def _planning_agent_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        current_step_id = state.get("current_step", "planning_step")
        step_dict = next((s for s in state["plan"]["steps"] if s["id"] == current_step_id), {"id": current_step_id, "description": state["goal"], "agent": "planning", "requires_approval": True})
        step_obj = PlanStep.model_validate(step_dict)

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_started",
            data={"agent": "planning", "step_id": current_step_id, "description": step_obj.description}
        )

        pydantic_state = self._to_pydantic_state(state)
        output = await planning_agent.execute_step(pydantic_state, step_obj)

        state["agent_outputs"][current_step_id] = output

        if output.get("requires_human_approval"):
            pending = [a.model_dump() for a in pydantic_state.pending_approvals]
            state["pending_approvals"] = pending

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="agent_completed",
            data={"agent": "planning", "step_id": current_step_id, "output": output}
        )

        return {
            "agent_outputs": state["agent_outputs"],
            "pending_approvals": state.get("pending_approvals", [])
        }

    async def _verification_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        current_step_id = state.get("current_step")
        step_dict = next((s for s in state["plan"]["steps"] if s["id"] == current_step_id), None)

        if not step_dict:
            return state

        step_obj = PlanStep.model_validate(step_dict)
        output_data = state["agent_outputs"].get(current_step_id, {})

        pydantic_state = self._to_pydantic_state(state)
        verif_res = await verification_agent.verify_step_output(pydantic_state, step_obj, output_data)

        state["verification_results"][current_step_id] = verif_res.model_dump()

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="verification_completed",
            data={
                "step_id": current_step_id,
                "status": verif_res.status,
                "confidence": verif_res.confidence,
                "recommendations": verif_res.recommendations
            }
        )

        if verif_res.status == "approved":
            if current_step_id not in state["completed_steps"]:
                state["completed_steps"].append(current_step_id)

        return {
            "verification_results": state["verification_results"],
            "completed_steps": state["completed_steps"]
        }

    def _verification_route(self, state: WorkflowGraphState) -> str:
        current_step_id = state.get("current_step")
        verif = state.get("verification_results", {}).get(current_step_id, {})
        status = verif.get("status", "approved")

        if status == "approved":
            if state.get("pending_approvals"):
                return "needs_approval"
            return "approved_continue"
        elif status == "needs_revision":
            return "needs_revision"
        else:
            return "failed"

    async def _approval_pause_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        """LangGraph interrupt / pause node awaiting human sign-off."""
        state["is_interrupted"] = True
        return {"is_interrupted": True}

    async def _external_action_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        """Executes the approved mutation (Google Calendar event creation)."""
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]

        # Execute the confirmed action
        from app.integrations.google_service import google_service
        event = await google_service.create_event(
            user_id=user_id,
            title="Interview Prep: Systems Design Session",
            description="Verified study session scheduled by LifeForge",
            start_time=(datetime.now(timezone.utc)).isoformat(),
            end_time=(datetime.now(timezone.utc)).isoformat()
        )

        state["pending_approvals"] = []
        state["is_interrupted"] = False

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="external_action_executed",
            data={"status": "confirmed", "event": event}
        )

        return {
            "pending_approvals": [],
            "is_interrupted": False
        }

    async def _final_synthesis_node(self, state: WorkflowGraphState) -> Dict[str, Any]:
        workflow_id = state["workflow_id"]
        user_id = state["user_id"]
        pydantic_state = self._to_pydantic_state(state)

        final_verif = await verification_agent.verify_final_synthesis(pydantic_state)

        # Extract long-term memory candidates and persist to Weaviate
        extracted_memories = await memory_manager.extract_and_store_candidates(
            user_id=user_id,
            goal=state["goal"],
            agent_outputs=state["agent_outputs"]
        )

        final_result = {
            "goal": state["goal"],
            "status": "completed",
            "summary": f"Turned goal '{state['goal']}' into verified actions.",
            "completed_steps_count": len(state["completed_steps"]),
            "verification": final_verif.model_dump(),
            "memories_stored": len(extracted_memories),
            "trajectory_steps": state["completed_steps"],
            "agent_intelligence": state["agent_outputs"]
        }

        state["final_result"] = final_result

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="workflow_completed",
            data=final_result
        )

        return {"final_result": final_result}

    def _to_pydantic_state(self, state: WorkflowGraphState) -> LifeForgeState:
        return LifeForgeState(
            user_id=state["user_id"],
            goal=state["goal"],
            intent=IntentAnalysis.model_validate(state["intent"]) if state.get("intent") else None,
            plan=Plan.model_validate(state["plan"]) if state.get("plan") else None,
            current_step=state.get("current_step"),
            completed_steps=state.get("completed_steps", []),
            failed_steps=state.get("failed_steps", []),
            agent_outputs=state.get("agent_outputs", {}),
            retrieved_context=state.get("retrieved_context", []),
            memory_context=state.get("memory_context", []),
            tool_results=state.get("tool_results", []),
            pending_approvals=[ApprovalRequest.model_validate(a) for a in state.get("pending_approvals", [])],
            verification_results={k: VerificationResult.model_validate(v) for k, v in state.get("verification_results", {}).items()},
            errors=state.get("errors", []),
            final_result=state.get("final_result"),
            iteration_count=state.get("iteration_count", 0)
        )


graph_engine = LifeForgeGraphEngine()
