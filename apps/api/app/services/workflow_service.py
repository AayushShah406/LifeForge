import asyncio
import logging
from datetime import datetime, timezone
import time
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.database.session import async_session_factory
from app.database.models import Workflow, WorkflowStep, Approval, AgentRun, Goal
from app.services.event_stream import event_broadcaster
from app.services.cost_tracker import cost_tracker
from app.models.provider import reasoning_model

logger = logging.getLogger("lifeforge.services.workflow")


def _get_engine():
    from app.workflows.lifeforge_graph import lifeforge_engine
    return lifeforge_engine


def _make_json_safe(obj: Any) -> Any:
    """Recursively converts Pydantic models, dates, and non-serializable objects into JSON-safe types."""
    if obj is None:
        return None
    if hasattr(obj, "model_dump"):
        return _make_json_safe(obj.model_dump())
    if hasattr(obj, "dict") and callable(getattr(obj, "dict")):
        return _make_json_safe(obj.dict())
    if isinstance(obj, dict):
        return {str(k): _make_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [_make_json_safe(x) for x in obj]
    if isinstance(obj, (datetime, time.struct_time)):
        return obj.isoformat() if hasattr(obj, "isoformat") else str(obj)
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if isinstance(obj, (str, int, float, bool)):
        return obj
    return str(obj)


class WorkflowService:
    """Manages full workflow lifecycle, database state synchronization, and execution resumes."""

    @staticmethod
    async def create_and_start_workflow(
        user_id: str,
        goal_prompt: str,
        goal_id: Optional[str] = None,
        title: Optional[str] = None
    ) -> Workflow:
        """Creates a workflow record and triggers asynchronous LangGraph execution."""
        workflow_id = str(uuid.uuid4())
        clean_title = title or (goal_prompt[:60] + "..." if len(goal_prompt) > 60 else goal_prompt)

        async with async_session_factory() as session:
            wf = Workflow(
                id=workflow_id,
                user_id=user_id,
                goal_id=goal_id,
                title=clean_title,
                status="pending",
                plan={},
                state_snapshot={},
                total_tokens=0,
                estimated_cost_usd=0.0
            )
            session.add(wf)
            await session.commit()
            await session.refresh(wf)

        # Trigger execution in background task
        asyncio.create_task(WorkflowService.execute_workflow(workflow_id, user_id, goal_prompt))
        return wf

    @staticmethod
    async def execute_workflow(workflow_id: str, user_id: str, goal: str) -> None:
        """Runs the LangGraph workflow asynchronously with state streaming and DB persistence."""
        start_time = time.perf_counter()
        logger.info(f"Starting workflow execution: {workflow_id} for user {user_id}")

        initial_state = {
            "user_id": user_id,
            "workflow_id": workflow_id,
            "goal": goal,
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

        config = {"configurable": {"thread_id": workflow_id}}

        async with async_session_factory() as session:
            stmt = select(Workflow).where(Workflow.id == workflow_id)
            res = await session.execute(stmt)
            wf = res.scalar_one_or_none()
            if wf:
                wf.status = "running"
                await session.commit()

        await event_broadcaster.broadcast(
            workflow_id=workflow_id,
            event_type="workflow_started",
            data={"workflow_id": workflow_id, "status": "running"}
        )

        last_state = initial_state
        try:
            engine = _get_engine()
            async for event in engine.graph.astream(initial_state, config=config, stream_mode="values"):
                last_state = event
                await WorkflowService._sync_state_to_db(workflow_id, user_id, event)

                # Check if execution interrupted for human approval
                if event.get("is_interrupted") or event.get("pending_approvals"):
                    logger.info(f"Workflow {workflow_id} paused for human approval.")
                    async with async_session_factory() as session:
                        stmt = select(Workflow).where(Workflow.id == workflow_id)
                        res = await session.execute(stmt)
                        wf = res.scalar_one_or_none()
                        if wf:
                            wf.status = "awaiting_approval"
                            wf.state_snapshot = _make_json_safe(event)
                            safe_plan = _make_json_safe(event.get("plan") or {})
                            if safe_plan:
                                wf.plan = safe_plan
                            await session.commit()

                        # Persist approval objects
                        for apprv in event.get("pending_approvals", []):
                            apprv_id = apprv.get("id") or str(uuid.uuid4())
                            existing = await session.execute(
                                select(Approval).where(Approval.id == apprv_id)
                            )
                            if not existing.scalar_one_or_none():
                                approval_row = Approval(
                                    id=apprv_id,
                                    workflow_id=workflow_id,
                                    step_id=event.get("current_step"),
                                    action_name=apprv.get("action", "unknown_action"),
                                    action_payload=_make_json_safe(apprv.get("parameters", {})),
                                    status="pending"
                                )
                                session.add(approval_row)
                        await session.commit()

                    await event_broadcaster.broadcast(
                        workflow_id=workflow_id,
                        event_type="workflow_awaiting_approval",
                        data={"pending_approvals": _make_json_safe(event.get("pending_approvals", []))}
                    )
                    return

            # Completed successfully
            duration_ms = (time.perf_counter() - start_time) * 1000
            total_tokens = 3500 + len(last_state.get("completed_steps", [])) * 450
            cost = cost_tracker.calculate_cost("gemini-3.1-pro-preview", total_tokens // 2, total_tokens // 2)

            async with async_session_factory() as session:
                stmt = select(Workflow).where(Workflow.id == workflow_id)
                res = await session.execute(stmt)
                wf = res.scalar_one_or_none()
                if wf:
                    wf.status = "completed"
                    wf.final_result = _make_json_safe(last_state.get("final_result") or {"summary": "Workflow completed successfully"})
                    wf.total_tokens = total_tokens
                    wf.estimated_cost_usd = cost
                    wf.state_snapshot = _make_json_safe(last_state)
                    safe_plan = _make_json_safe(last_state.get("plan") or {})
                    if safe_plan:
                        wf.plan = safe_plan
                    await session.commit()

            await event_broadcaster.broadcast(
                workflow_id=workflow_id,
                event_type="workflow_completed",
                data={
                    "workflow_id": workflow_id,
                    "final_result": last_state.get("final_result"),
                    "duration_ms": duration_ms
                }
            )

        except Exception as e:
            logger.error(f"Error executing workflow {workflow_id}: {e}", exc_info=True)
            async with async_session_factory() as session:
                stmt = select(Workflow).where(Workflow.id == workflow_id)
                res = await session.execute(stmt)
                wf = res.scalar_one_or_none()
                if wf:
                    wf.status = "failed"
                    wf.final_result = {"error": str(e)}
                    await session.commit()

            await event_broadcaster.broadcast(
                workflow_id=workflow_id,
                event_type="workflow_error",
                data={"error": str(e)}
            )

    @staticmethod
    async def resolve_approval(
        workflow_id: str,
        approval_id: str,
        decision: str,
        comment: Optional[str] = None
    ) -> bool:
        """Approve or reject a pending approval and resume workflow if approved."""
        config = {"configurable": {"thread_id": workflow_id}}

        async with async_session_factory() as session:
            # Update approval row
            apprv_res = await session.execute(
                select(Approval).where(Approval.id == approval_id, Approval.workflow_id == workflow_id)
            )
            apprv = apprv_res.scalar_one_or_none()
            if not apprv:
                # Try finding any pending approval for this workflow
                apprv_res = await session.execute(
                    select(Approval).where(Approval.workflow_id == workflow_id, Approval.status == "pending")
                )
                apprv = apprv_res.scalar_one_or_none()

            if apprv:
                apprv.status = "approved" if decision.lower() in ["approved", "approve"] else "rejected"
                apprv.reviewed_at = datetime.now(timezone.utc)
                if comment:
                    apprv.comments = comment

            # Get workflow
            wf_res = await session.execute(select(Workflow).where(Workflow.id == workflow_id))
            wf = wf_res.scalar_one_or_none()
            if not wf:
                return False

            snapshot = wf.state_snapshot or {}

            if decision.lower() in ["approved", "approve"]:
                wf.status = "running"
                snapshot["is_interrupted"] = False
                snapshot["pending_approvals"] = []
                wf.state_snapshot = snapshot
                await session.commit()

                # Resume execution
                asyncio.create_task(
                    WorkflowService._resume_execution(workflow_id, wf.user_id, snapshot, config)
                )
                return True
            else:
                wf.status = "rejected"
                await session.commit()
                await event_broadcaster.broadcast(
                    workflow_id=workflow_id,
                    event_type="workflow_rejected",
                    data={"workflow_id": workflow_id, "comment": comment}
                )
                return True

    @staticmethod
    async def _resume_execution(
        workflow_id: str,
        user_id: str,
        state: Dict[str, Any],
        config: Dict[str, Any]
    ) -> None:
        """Resumes graph stream after approval."""
        logger.info(f"Resuming workflow execution: {workflow_id}")
        last_state = state
        try:
            engine = _get_engine()
            async for event in engine.graph.astream(state, config=config, stream_mode="values"):
                last_state = event
                await WorkflowService._sync_state_to_db(workflow_id, user_id, event)

            async with async_session_factory() as session:
                wf_res = await session.execute(select(Workflow).where(Workflow.id == workflow_id))
                wf = wf_res.scalar_one_or_none()
                if wf:
                    wf.status = "completed"
                    wf.final_result = last_state.get("final_result") or {"summary": "Workflow resumed and completed"}
                    wf.state_snapshot = last_state
                    await session.commit()

            await event_broadcaster.broadcast(
                workflow_id=workflow_id,
                event_type="workflow_completed",
                data={"workflow_id": workflow_id, "final_result": last_state.get("final_result")}
            )
        except Exception as e:
            logger.error(f"Error resuming workflow {workflow_id}: {e}", exc_info=True)

    @staticmethod
    async def _sync_state_to_db(workflow_id: str, user_id: str, state: Dict[str, Any]) -> None:
        """Synchronizes LangGraph state dictionary into PostgreSQL/SQLite models."""
        async with async_session_factory() as session:
            stmt = select(Workflow).where(Workflow.id == workflow_id)
            res = await session.execute(stmt)
            wf = res.scalar_one_or_none()
            if not wf:
                return

            safe_state = _make_json_safe(state)
            safe_plan = safe_state.get("plan") or {}

            if safe_plan:
                wf.plan = safe_plan
            if safe_state.get("current_step"):
                wf.current_step_id = safe_state["current_step"]
            wf.state_snapshot = safe_state

            # Upsert workflow steps
            steps = safe_plan.get("steps", []) if isinstance(safe_plan, dict) else []
            completed_list = safe_state.get("completed_steps", [])
            failed_list = safe_state.get("failed_steps", [])
            curr_step = safe_state.get("current_step")

            for idx, s in enumerate(steps):
                if not isinstance(s, dict):
                    continue
                s_id = s.get("id", f"step_{idx}")
                step_stmt = select(WorkflowStep).where(
                    WorkflowStep.workflow_id == workflow_id,
                    WorkflowStep.step_key == s_id
                )
                step_res = await session.execute(step_stmt)
                existing_step = step_res.scalar_one_or_none()

                step_status = (
                    "completed" if s_id in completed_list
                    else "running" if s_id == curr_step
                    else "failed" if s_id in failed_list
                    else "pending"
                )

                s_out = safe_state.get("agent_outputs", {}).get(s_id)
                s_verif = safe_state.get("verification_results", {}).get(s_id, {}).get("status") if isinstance(safe_state.get("verification_results"), dict) else None

                if not existing_step:
                    new_step = WorkflowStep(
                        id=str(uuid.uuid4()),
                        workflow_id=workflow_id,
                        step_key=s_id,
                        agent_name=s.get("agent", "agent"),
                        title=s.get("description", s_id),
                        order=idx,
                        status=step_status,
                        input_data=s,
                        output_data=s_out,
                        verification_status=s_verif
                    )
                    session.add(new_step)
                else:
                    existing_step.status = step_status
                    if s_out is not None:
                        existing_step.output_data = s_out
                    if s_verif is not None:
                        existing_step.verification_status = s_verif

            await session.commit()

    @staticmethod
    async def get_workflow_by_id(workflow_id: str, user_id: Optional[str] = None) -> Optional[Workflow]:
        """Retrieves a workflow with its steps and pending approvals loaded."""
        async with async_session_factory() as session:
            query = (
                select(Workflow)
                .where(Workflow.id == workflow_id)
                .options(selectinload(Workflow.steps), selectinload(Workflow.approvals))
            )
            if user_id:
                query = query.where(Workflow.user_id == user_id)
            res = await session.execute(query)
            return res.scalar_one_or_none()

    @staticmethod
    async def list_workflows(user_id: str, limit: int = 20, offset: int = 0) -> List[Workflow]:
        """Lists recent workflows for a user."""
        async with async_session_factory() as session:
            stmt = (
                select(Workflow)
                .where(Workflow.user_id == user_id)
                .order_by(desc(Workflow.created_at))
                .limit(limit)
                .offset(offset)
                .options(selectinload(Workflow.steps), selectinload(Workflow.approvals))
            )
            res = await session.execute(stmt)
            return list(res.scalars().all())


workflow_service = WorkflowService()
workflow_runner = workflow_service
