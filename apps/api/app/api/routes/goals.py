import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, User, Goal
from app.api.deps import get_current_user
from app.schemas.goal import GoalCreate, GoalResponse
from app.agents.supervisor import supervisor_agent
from app.agents.state import LifeForgeWorkflowState

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new high-level goal and run immediate intent analysis via Supervisor."""
    state_input: LifeForgeWorkflowState = {
        "user_id": user.id,
        "workflow_id": "",
        "goal": payload.raw_prompt,
        "intent": {},
        "plan": {},
        "current_step": None,
        "completed_steps": [],
        "failed_steps": [],
        "agent_outputs": {},
        "retrieved_context": [],
        "memory_context": [],
        "tool_results": [],
        "pending_approvals": [],
        "verification_results": {},
        "errors": [],
        "final_result": None,
        "iteration_count": 0,
        "is_interrupted": False
    }

    intent = await supervisor_agent.analyze_intent(state_input)
    goal_id = str(uuid.uuid4())
    topic = intent.entities.get("topic") if intent.entities else None
    title = (payload.raw_prompt[:60] + "..." if len(payload.raw_prompt) > 60 else payload.raw_prompt)

    goal = Goal(
        id=goal_id,
        user_id=user.id,
        raw_prompt=payload.raw_prompt,
        title=title,
        status="active",
        category=payload.category or "general",
        intent_data=intent.model_dump(),
        target_date=payload.target_date
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.get("", response_model=List[GoalResponse])
async def list_goals(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all goals for current user."""
    stmt = select(Goal).where(Goal.user_id == user.id).order_by(desc(Goal.created_at))
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve specific goal by ID."""
    stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id)
    res = await db.execute(stmt)
    goal = res.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a goal."""
    stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user.id)
    res = await db.execute(stmt)
    goal = res.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)
    await db.commit()
