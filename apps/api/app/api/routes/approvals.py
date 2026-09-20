from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, User, Approval, Workflow
from app.api.deps import get_current_user
from app.services.workflow_service import workflow_service

router = APIRouter(prefix="/approvals", tags=["Approvals"])


class ApprovalActionRequest(BaseModel):
    decision: str = Field(..., description="'approved' or 'rejected'")
    comment: Optional[str] = None


@router.get("")
async def list_pending_approvals(
    status_filter: str = "pending",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List pending human approvals requiring user intervention."""
    stmt = (
        select(Approval)
        .join(Workflow, Approval.workflow_id == Workflow.id)
        .where(Workflow.user_id == user.id)
    )
    if status_filter:
        stmt = stmt.where(Approval.status == status_filter)
    stmt = stmt.order_by(desc(Approval.created_at))

    res = await db.execute(stmt)
    approvals = res.scalars().all()
    return [
        {
            "id": a.id,
            "workflow_id": a.workflow_id,
            "step_id": a.step_id,
            "action_name": a.action_name,
            "action_payload": a.action_payload,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
            "comments": a.comments,
        }
        for a in approvals
    ]


@router.post("/{approval_id}/decision")
async def decide_approval(
    approval_id: str,
    payload: ApprovalActionRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject a pending sensitive action, unpausing the workflow if approved."""
    stmt = (
        select(Approval)
        .join(Workflow, Approval.workflow_id == Workflow.id)
        .where(Approval.id == approval_id, Workflow.user_id == user.id)
    )
    res = await db.execute(stmt)
    apprv = res.scalar_one_or_none()
    if not apprv:
        raise HTTPException(status_code=404, detail="Approval request not found")

    success = await workflow_service.resolve_approval(
        workflow_id=apprv.workflow_id,
        approval_id=approval_id,
        decision=payload.decision,
        comment=payload.comment
    )
    return {
        "approval_id": approval_id,
        "status": payload.decision,
        "workflow_id": apprv.workflow_id,
        "resumed": payload.decision.lower() in ["approved", "approve"] and success
    }
