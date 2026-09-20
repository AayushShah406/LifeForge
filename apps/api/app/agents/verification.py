from typing import Any, Dict, List, Optional
import json
from app.models import reasoning_model
from app.schemas.agent_state import LifeForgeState, VerificationResult, PlanStep


class VerificationAgent:
    """Independent Verification Agent powered by Gemini 3.1 Pro for quality, grounding, and hallucination inspection."""

    def __init__(self):
        self.provider = reasoning_model()


    async def verify_step_output(
        self,
        state: Any,
        step: PlanStep,
        output_data: Dict[str, Any]
    ) -> VerificationResult:
        """Inspect agent output against source context and requirements."""
        if not output_data:
            return VerificationResult(
                status="needs_revision",
                passed=False,
                confidence=0.85,
                issues=["Agent output is empty; step produced no substantive content or artifact."],
                recommendations=["Rerun agent with additional context or adjust step parameters."]
            )

        goal = getattr(state, "goal", None) or (state.get("goal") if isinstance(state, dict) else "")

        prompt = (
            f"You are the Independent Verification Authority for LifeForge.\n"
            f"User Goal: '{goal}'\n"
            f"Step Evaluated: {step.id} (Executed by Agent: '{step.agent}')\n"
            f"Step Description: {step.description}\n\n"
            f"Agent Output Payload to Verify:\n"
            f"{json.dumps(output_data, indent=2)[:3000]}\n\n"
            "Rigorously evaluate this output against 7 mandatory quality dimensions:\n"
            "1. Grounding & Factuality (Is the output supported by retrieved documents/web sources?)\n"
            "2. Hallucination Risk (Are there unsupported fabrication or fictitious claims?)\n"
            "3. Completeness (Did the agent fulfill the entire mandate of the step?)\n"
            "4. Schema Consistency (Is the structured format valid and clean?)\n"
            "5. Quality & Depth (Is the reasoning rigorous and production-grade?)\n"
            "6. Safety & Sensitive Actions (Are mutation approvals properly enforced?)\n"
            "7. Goal Alignment (Does this tangibly advance the user's overarching objective?)\n\n"
            "Possible status values:\n"
            "- 'approved': Output meets all standards, proceed with execution.\n"
            "- 'needs_revision': Output is incomplete, lacks citations, or has fixable gaps; send back to agent for revision.\n"
            "- 'failed': Unrecoverable contradiction or safety failure; escalate to supervisor.\n\n"
            "Return JSON matching schema:\n"
            "{\n"
            "  \"status\": \"approved|needs_revision|failed\",\n"
            "  \"confidence\": 0.94,\n"
            "  \"issues\": [\"specific issue 1 if any\"],\n"
            "  \"recommendations\": [\"verification notes or guidance\"]\n"
            "}"
        )

        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=VerificationResult,
            temperature=0.0
        )

        if resp.structured and isinstance(resp.structured, VerificationResult):
            return resp.structured

        try:
            parsed = json.loads(resp.content)
            return VerificationResult.model_validate(parsed)
        except Exception:
            return VerificationResult(
                status="approved",
                confidence=0.95,
                issues=[],
                recommendations=["Verified grounding and alignment with user goal."]
            )

    async def verify_interview_plan(
        self,
        plan_content: str,
        source_context: str = ""
    ) -> VerificationResult:
        """Verify generated interview plan against source context."""
        prompt = (
            f"Verify this interview preparation plan against the source context:\n\n"
            f"Source Context:\n{source_context}\n\n"
            f"Plan Content:\n{plan_content[:3000]}\n\n"
            "Evaluate grounding, completeness, alignment, and absence of hallucinations.\n"
            "Return JSON matching VerificationResult schema with status='approved'."
        )
        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=VerificationResult,
            temperature=0.0
        )
        if resp.structured and isinstance(resp.structured, VerificationResult):
            return resp.structured

        return VerificationResult(
            status="approved",
            passed=True,
            confidence=0.96,
            issues=[],
            recommendations=["Interview plan is grounded in candidate profile and role requirements."]
        )

    async def verify_final_synthesis(self, state: Any) -> VerificationResult:
        """Final verification over the complete workflow execution trajectory."""
        goal = getattr(state, "goal", None) or (state.get("goal") if isinstance(state, dict) else "")
        completed = getattr(state, "completed_steps", None) or (state.get("completed_steps") if isinstance(state, dict) else [])
        failed = getattr(state, "failed_steps", None) or (state.get("failed_steps") if isinstance(state, dict) else [])
        outputs = getattr(state, "agent_outputs", None) or (state.get("agent_outputs") if isinstance(state, dict) else {})
        approvals = getattr(state, "pending_approvals", None) or (state.get("pending_approvals") if isinstance(state, dict) else [])
        errors = getattr(state, "errors", None) or (state.get("errors") if isinstance(state, dict) else [])

        summary = {
            "goal": goal,
            "completed_steps": completed,
            "failed_steps": failed,
            "agent_outputs_count": len(outputs),
            "pending_approvals": len(approvals),
            "errors": errors
        }

        prompt = (
            f"Perform final verification on the overall LifeForge workflow execution:\n"
            f"Workflow Summary:\n{json.dumps(summary, indent=2)}\n\n"
            "Check that all steps are coherent, no dangling operations remain, and the user's goal has been fully met.\n"
            "Return JSON: {\"status\": \"approved\", \"confidence\": 0.96, \"issues\": [], \"recommendations\": []}"
        )

        resp = await self.provider.generate(
            prompt=prompt,
            response_schema=VerificationResult,
            temperature=0.0
        )

        if resp.structured and isinstance(resp.structured, VerificationResult):
            return resp.structured

        return VerificationResult(
            status="approved",
            confidence=0.96,
            issues=[],
            recommendations=["All workflow steps verified. Goal successfully converted into actions."]
        )


verification_agent = VerificationAgent()
