import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, User, Goal
from app.api.deps import get_current_user
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowResponse,
    ApprovalDecision,
    StepResponse
)
from app.services.workflow_service import workflow_service
from app.services.event_stream import event_broadcaster

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_workflow(
    payload: WorkflowCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Start an autonomous agentic workflow for a goal prompt or existing goal ID."""
    goal_prompt = payload.goal_prompt

    if payload.goal_id and not goal_prompt:
        stmt = select(Goal).where(Goal.id == payload.goal_id, Goal.user_id == user.id)
        res = await db.execute(stmt)
        goal = res.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=404, detail="Referenced goal not found")
        goal_prompt = goal.raw_prompt

    if not goal_prompt:
        raise HTTPException(status_code=400, detail="Either goal_prompt or valid goal_id must be provided")

    wf = await workflow_service.create_and_start_workflow(
        user_id=user.id,
        goal_prompt=goal_prompt,
        goal_id=payload.goal_id,
        title=payload.title
    )
    # Fetch with relationships loaded
    full_wf = await workflow_service.get_workflow_by_id(wf.id, user_id=user.id)
    return full_wf or wf


@router.get("", response_model=List[WorkflowResponse])
async def list_workflows(
    limit: int = 20,
    offset: int = 0,
    user: User = Depends(get_current_user)
):
    """List recent workflows for current user."""
    return await workflow_service.list_workflows(user_id=user.id, limit=limit, offset=offset)


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    user: User = Depends(get_current_user)
):
    """Get workflow status, plan, completed steps, and pending approvals."""
    wf = await workflow_service.get_workflow_by_id(workflow_id=workflow_id, user_id=user.id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.get("/{workflow_id}/stream")
async def stream_workflow_events(
    workflow_id: str,
    token: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Server-Sent Events (SSE) streaming real-time workflow state and agent trajectories.
    Accepts token as query param since EventSource cannot set Authorization headers.
    """
    actual_user_id = user.id
    if token:
        from app.core.security import decode_access_token
        decoded = decode_access_token(token)
        if decoded:
            actual_user_id = decoded

    wf = await workflow_service.get_workflow_by_id(workflow_id=workflow_id, user_id=actual_user_id)
    if not wf:
        wf = await workflow_service.get_workflow_by_id(workflow_id=workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return StreamingResponse(
        event_broadcaster.event_generator(workflow_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.post("/{workflow_id}/approve", status_code=status.HTTP_200_OK)
async def approve_workflow_action(
    workflow_id: str,
    payload: ApprovalDecision,
    user: User = Depends(get_current_user)
):
    """Human-in-the-loop: Approve a pending action to resume execution."""
    wf = await workflow_service.get_workflow_by_id(workflow_id=workflow_id, user_id=user.id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    success = await workflow_service.resolve_approval(
        workflow_id=workflow_id,
        approval_id=payload.approval_id,
        decision="approved",
        comment=payload.comment
    )
    if not success:
        raise HTTPException(status_code=400, detail="Unable to approve action or workflow not paused")

    return {"status": "approved", "workflow_id": workflow_id, "resumed": True}


@router.post("/{workflow_id}/reject", status_code=status.HTTP_200_OK)
async def reject_workflow_action(
    workflow_id: str,
    payload: ApprovalDecision,
    user: User = Depends(get_current_user)
):
    """Human-in-the-loop: Reject a pending action and halt execution."""
    wf = await workflow_service.get_workflow_by_id(workflow_id=workflow_id, user_id=user.id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    success = await workflow_service.resolve_approval(
        workflow_id=workflow_id,
        approval_id=payload.approval_id,
        decision="rejected",
        comment=payload.comment
    )
    return {"status": "rejected", "workflow_id": workflow_id, "resumed": False}
