"""Human-in-the-Loop Approval Manager (Sections 27, 41, 74).

Manages approval lifecycle:
1. Agent attempts sensitive action (send email, create/update calendar event, external mutation)
2. Graph halts/pauses execution
3. Approval record is created in PostgreSQL approvals table
4. approval_required event is dispatched via SSE
5. User reviews, approves or rejects
6. Graph resumes and executes tool or aborts
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import select

from app.database.session import async_session_factory
from app.database.models import Approval, Workflow
from app.workflows.events import workflow_event_bus

logger = logging.getLogger("lifeforge.workflows.human_approval")


class HumanApprovalManager:
    """Manages sensitive action approvals, notifications, and workflow resumes."""

    @staticmethod
    async def create_approval_request(
        workflow_id: str,
        user_id: Optional[str] = None,
        action_type: str = "general",
        title: str = "",
        description: str = "",
        payload: Optional[Dict[str, Any]] = None,
        step_id: Optional[str] = None,
        tool_call_id: Optional[str] = None,
        **kwargs: Any
    ) -> Approval:
        approval_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        resolved_payload = payload or {}

        async with async_session_factory() as session:
            resolved_user_id = user_id
            wf_stmt = select(Workflow).where(Workflow.id == workflow_id)
            wf_res = await session.execute(wf_stmt)
            wf = wf_res.scalar_one_or_none()
            if not resolved_user_id and wf and wf.user_id:
                resolved_user_id = wf.user_id
            resolved_user_id = resolved_user_id or "user_default"

            approval = Approval(
                id=approval_id,
                user_id=resolved_user_id,
                workflow_id=workflow_id,
                tool_call_id=tool_call_id,
                action_type=action_type,
                description=f"{title}: {description}" if title else description,
                payload=resolved_payload,
                status="pending",
                requested_at=now,
                comments=description
            )
            session.add(approval)

            # Update workflow status to waiting_approval
            if wf:
                wf.status = "waiting_approval"

            await session.commit()
            await session.refresh(approval)

        # Emit real-time event
        await workflow_event_bus.emit(
            workflow_id=workflow_id,
            event_type="approval_required",
            payload={
                "approval_id": approval_id,
                "action_type": action_type,
                "title": title,
                "description": description,
                "payload": payload
            }
        )
        await workflow_event_bus.emit(
            workflow_id=workflow_id,
            event_type="workflow_paused",
            payload={"reason": f"Waiting for human approval on {action_type}"}
        )

        return approval

    @staticmethod
    async def decide_approval(
        approval_id: str,
        decision: str,  # approved or rejected
        comment: Optional[str] = None
    ) -> Dict[str, Any]:
        """Approve or reject a pending approval request and resume or terminate workflow."""
        now = datetime.now(timezone.utc)
        async with async_session_factory() as session:
            stmt = select(Approval).where(Approval.id == approval_id)
            res = await session.execute(stmt)
            approval = res.scalar_one_or_none()

            if not approval:
                raise ValueError(f"Approval request '{approval_id}' not found.")

            approval.status = decision
            approval.comments = comment
            if decision == "approved":
                approval.approved_at = now
            else:
                approval.rejected_at = now

            # Update workflow status
            wf_stmt = select(Workflow).where(Workflow.id == approval.workflow_id)
            wf_res = await session.execute(wf_stmt)
            wf = wf_res.scalar_one_or_none()
            if wf:
                if decision == "approved":
                    wf.status = "running"
                else:
                    wf.status = "cancelled"

            await session.commit()

            workflow_id = approval.workflow_id
            action_type = approval.action_type
            payload = approval.payload

        # Emit real-time resume or pause event
        if decision == "approved":
            await workflow_event_bus.emit(
                workflow_id=workflow_id,
                event_type="workflow_resumed",
                payload={"approval_id": approval_id, "action_type": action_type}
            )
        else:
            await workflow_event_bus.emit(
                workflow_id=workflow_id,
                event_type="workflow_failed",
                payload={"approval_id": approval_id, "reason": "Action rejected by user"}
            )

        return {
            "approval_id": approval_id,
            "decision": decision,
            "workflow_id": workflow_id,
            "action_type": action_type,
            "payload": payload
        }


human_approval_manager = HumanApprovalManager()
