import json
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

from app.models import reasoning_model
from app.schemas.agent_state import LifeForgeState, IntentAnalysis

logger = logging.getLogger("lifeforge.agents.supervisor")


class RoutingDecision(BaseModel):
    next_node: str = Field(..., description="Target node: research_agent, document_agent, interview_agent, planning_agent, or final_synthesis")
    reasoning: str = Field(..., description="Explanation for routing selection")
    target_step_id: Optional[str] = None
    next_agent: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def set_next_agent(cls, data: Any) -> Any:
        if isinstance(data, dict):
            node = data.get("next_node", "")
            agent = data.get("next_agent") or node.replace("_agent", "")
            data["next_agent"] = agent
            if not data.get("next_node"):
                data["next_node"] = f"{agent}_agent" if not agent.endswith("_agent") else agent
        return data


class SupervisorAgent:
    """Supervisor Agent powered by Gemini 3.1 Pro for high-level reasoning, intent classification, and routing."""

    def __init__(self):
        self.provider = reasoning_model()

    async def analyze_intent(self, state: Any) -> IntentAnalysis:
        """Analyze user goal, extract entities, identify category, check clarification needs."""
        goal = getattr(state, "goal", None) or (state.get("goal") if isinstance(state, dict) else "")
        memory_ctx = getattr(state, "memory_context", None) or (state.get("memory_context") if isinstance(state, dict) else [])
        memories_str = chr(10).join(memory_ctx) if memory_ctx else "No prior memories."

        prompt = (
            f"Analyze this user goal for the LifeForge agentic operations platform:\n"
            f"Goal: '{goal}'\n\n"
            f"Personal memory context retrieved:\n"
            f"{memories_str}\n\n"
            "Evaluate:\n"
            "1. Primary intent (e.g. interview_prep, document_analysis, action_planning, general_task)\n"
            "2. Confidence score (0.0 to 1.0)\n"
            "3. Extracted key entities (company, role, skills, dates)\n"
            "4. Does this need user clarification before creating an execution plan? (true/false)\n"
            "5. If clarification is needed, specify the question."
        )

        resp = await self.provider.generate(
            prompt=prompt,
            system_instruction="You are the LifeForge Supervisor Agent. Analyze the goal thoroughly and return structured JSON.",
            response_schema=IntentAnalysis,
            temperature=0.1
        )

        if resp.structured and isinstance(resp.structured, IntentAnalysis):
            return resp.structured

        try:
            data = json.loads(resp.content)
            return IntentAnalysis.model_validate(data)
        except Exception:
            is_vague = len(goal.strip()) < 10 or goal.strip().lower() in ["help", "do something", "hi", "hello"]
            return IntentAnalysis(
                intent="interview_prep" if "interview" in goal.lower() else "action_planning",
                confidence=0.40 if is_vague else 0.90,
                entities={"goal": goal},
                needs_clarification=is_vague,
                clarification_question="Could you clarify the specific goal, company, or target date?" if is_vague else None,
                category="interview" if "interview" in goal.lower() else "general"
            )

    async def analyze_intent_raw(self, prompt: str) -> IntentAnalysis:
        """Analyze intent directly from a raw prompt string."""
        state = LifeForgeState(
            goal=prompt,
            user_id="system",
            workflow_id="temp_intent_eval"
        )
        return await self.analyze_intent(state)

    async def determine_next_step(self, state: Any) -> RoutingDecision:
        """Determines the next execution step from current state."""
        goal = getattr(state, "goal", None) or (state.get("goal") if isinstance(state, dict) else "")
        current_step = getattr(state, "current_step", None) or (state.get("current_step") if isinstance(state, dict) else None)
        completed_steps = getattr(state, "completed_steps", None) or (state.get("completed_steps") if isinstance(state, dict) else [])
        plan_obj = getattr(state, "plan", None) or (state.get("plan") if isinstance(state, dict) else {})
        steps = getattr(plan_obj, "steps", None) or (plan_obj.get("steps") if isinstance(plan_obj, dict) else [])
        steps_dicts = [s.model_dump() if hasattr(s, "model_dump") else s for s in steps]
        outputs = getattr(state, "agent_outputs", None) or (state.get("agent_outputs") if isinstance(state, dict) else {})

        return await self.decide_next_routing(
            goal=goal,
            current_step=current_step,
            completed_steps=completed_steps,
            available_agents=["document", "research", "interview", "planning"],
            agent_outputs=outputs,
            plan_steps=steps_dicts
        )

    async def decide_next_routing(
        self,
        goal: str,
        current_step: Optional[str],
        completed_steps: List[str],
        available_agents: List[str],
        agent_outputs: Dict[str, Any],
        plan_steps: List[Dict[str, Any]]
    ) -> RoutingDecision:
        """Produces structured routing decisions based on LLM reasoning and DAG dependency completion."""
        for step in plan_steps:
            s_id = step.get("id")
            s_agent = step.get("agent", "")
            s_status = step.get("status", "pending")
            s_deps = step.get("dependencies", [])

            if s_status == "needs_revision":
                return RoutingDecision(
                    next_node=f"{s_agent}_agent" if not s_agent.endswith("_agent") else s_agent,
                    reasoning=f"Step {s_id} marked as needs_revision by Verification Agent.",
                    target_step_id=s_id
                )

            if s_status == "pending":
                if all(d in completed_steps for d in s_deps):
                    node_name = f"{s_agent}_agent" if not s_agent.endswith("_agent") else s_agent
                    return RoutingDecision(
                        next_node=node_name,
                        reasoning=f"All dependencies for step {s_id} ({s_agent}) are met.",
                        target_step_id=s_id
                    )

        if len(completed_steps) >= len(plan_steps) and len(plan_steps) > 0:
            return RoutingDecision(
                next_node="final_synthesis",
                reasoning="All execution steps in plan successfully verified."
            )

        prompt = (
            f"User Goal: {goal}\n"
            f"Completed Steps: {completed_steps}\n"
            f"Available Agents: {available_agents}\n"
            "Select the single best next agent node to execute or 'final_synthesis' if complete."
        )

        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=RoutingDecision,
            temperature=0.0
        )

        if resp.structured and isinstance(resp.structured, RoutingDecision):
            return resp.structured

        return RoutingDecision(
            next_node="final_synthesis",
            reasoning="Default progression to final synthesis."
        )


supervisor_agent = SupervisorAgent()

__all__ = ["SupervisorAgent", "supervisor_agent", "RoutingDecision"]
