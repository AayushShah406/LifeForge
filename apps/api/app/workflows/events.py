"""Real-Time Workflow Event Bus and SSE Stream Dispatcher (Section 34).

Dispatches structured events to real-time subscribers and persists them
into the PostgreSQL workflow_events table for auditing and replay.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, List, Optional
from collections import defaultdict

from app.database.session import async_session_factory
from app.database.models import WorkflowEvent

logger = logging.getLogger("lifeforge.workflows.events")


class WorkflowEventBus:
    """In-memory pub/sub event bus with asynchronous generator streaming."""

    def __init__(self):
        self._subscribers: Dict[str, List[asyncio.Queue]] = defaultdict(list)
        self._sequences: Dict[str, int] = defaultdict(int)

    async def emit(
        self,
        workflow_id: str,
        event_type: str,
        payload: Optional[Dict[str, Any]] = None,
        agent_name: Optional[str] = None
    ) -> None:
        """Publish a lifecycle event to active subscribers and persist to database."""
        self._sequences[workflow_id] += 1
        sequence = self._sequences[workflow_id]
        payload = payload or {}
        now = datetime.now(timezone.utc)

        event_data = {
            "workflow_id": workflow_id,
            "event_type": event_type,
            "agent_name": agent_name,
            "sequence": sequence,
            "payload": payload,
            "timestamp": now.isoformat()
        }

        # 1. Dispatch to active SSE subscribers
        queues = self._subscribers.get(workflow_id, [])
        for q in queues:
            await q.put(event_data)

        # 2. Persist to PostgreSQL workflow_events table
        try:
            async with async_session_factory() as session:
                ev = WorkflowEvent(
                    workflow_id=workflow_id,
                    event_type=event_type,
                    agent_name=agent_name,
                    payload=payload,
                    sequence=sequence,
                    created_at=now
                )
                session.add(ev)
                await session.commit()
        except Exception as e:
            logger.debug(f"Event DB persistence note for {workflow_id}: {e}")

    async def subscribe(self, workflow_id: str) -> AsyncGenerator[str, None]:
        """Subscribe to real-time Server-Sent Events (SSE) for a workflow."""
        q = asyncio.Queue()
        self._subscribers[workflow_id].append(q)
        try:
            while True:
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
                if data.get("event_type") in ("workflow_completed", "workflow_failed", "workflow_cancelled"):
                    break
        finally:
            if q in self._subscribers[workflow_id]:
                self._subscribers[workflow_id].remove(q)


# Global event bus singleton
workflow_event_bus = WorkflowEventBus()
