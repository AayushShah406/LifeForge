from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, User, EvaluationRun, EvaluationResult
from app.api.deps import get_current_user
from app.schemas.evaluation import EvaluationRunCreate, EvaluationRunResponse
from app.evaluation.runner import evaluation_runner

router = APIRouter(prefix="/evaluations", tags=["AI Evaluations"])


@router.get("", response_model=List[EvaluationRunResponse])
async def list_evaluations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List historical AI evaluation benchmark runs."""
    stmt = (
        select(EvaluationRun)
        .options(selectinload(EvaluationRun.results))
        .order_by(desc(EvaluationRun.created_at))
    )
    res = await db.execute(stmt)
    runs = res.scalars().all()

    if not runs:
        # Run baseline benchmark if no records exist yet
        try:
            init_run = await evaluation_runner.run_benchmark(
                dataset_name="interview_prep_v1",
                suite_type="end_to_end"
            )
            return [init_run]
        except Exception:
            return []

    return runs


@router.post("/run", response_model=EvaluationRunResponse, status_code=status.HTTP_201_CREATED)
async def trigger_evaluation_run(
    payload: EvaluationRunCreate,
    user: User = Depends(get_current_user)
):
    """Trigger automated AI evaluation against benchmark datasets."""
    run_record = await evaluation_runner.run_benchmark(
        dataset_name=payload.dataset_name,
        suite_type=payload.suite_type
    )
    return run_record


@router.get("/{run_id}", response_model=EvaluationRunResponse)
async def get_evaluation_detail(
    run_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detailed scorecard and test cases for an evaluation run."""
    stmt = (
        select(EvaluationRun)
        .where(EvaluationRun.id == run_id)
        .options(selectinload(EvaluationRun.results))
    )
    res = await db.execute(stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Evaluation run not found")
    return run
