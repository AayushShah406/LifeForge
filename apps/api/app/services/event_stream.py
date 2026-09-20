import asyncio
from datetime import datetime, timezone
import json
from typing import Any, AsyncGenerator, Dict, List, Optional, Set


class SSEEventBroadcaster:
    """Broadcaster for Server-Sent Events (SSE) streaming real-time workflow state."""

    def __init__(self):
        # Map of workflow_id to set of asyncio.Queue instances
        self._listeners: Dict[str, Set[asyncio.Queue]] = {}

    def subscribe(self, workflow_id: str) -> asyncio.Queue:
        """Subscribe a new client to workflow updates."""
        if workflow_id not in self._listeners:
            self._listeners[workflow_id] = set()
        queue = asyncio.Queue()
        self._listeners[workflow_id].add(queue)
        return queue

    def unsubscribe(self, workflow_id: str, queue: asyncio.Queue) -> None:
        """Remove a disconnected client."""
        if workflow_id in self._listeners:
            self._listeners[workflow_id].discard(queue)
            if not self._listeners[workflow_id]:
                del self._listeners[workflow_id]

    async def broadcast(self, workflow_id: str, event_type: Any, data: Optional[dict] = None) -> None:
        """Broadcast an event to all connected listeners of a workflow."""
        if isinstance(event_type, dict) and data is None:
            data = event_type
            event_name = data.get("type") or data.get("event") or "message"
        else:
            event_name = str(event_type)
            data = data or {}

        payload = {
            "workflow_id": workflow_id,
            "event": event_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }

        if workflow_id in self._listeners:
            dead_queues = []
            for queue in self._listeners[workflow_id]:
                try:
                    queue.put_nowait(payload)
                except asyncio.QueueFull:
                    dead_queues.append(queue)
            for dead in dead_queues:
                self.unsubscribe(workflow_id, dead)

    async def event_generator(self, workflow_id: str) -> AsyncGenerator[str, None]:
        """Async generator formatting SSE stream data."""
        queue = self.subscribe(workflow_id)
        try:
            # Send initial connection ping
            init_data = json.dumps({"status": "connected", "workflow_id": workflow_id})
            yield f"event: ping\ndata: {init_data}\n\n"

            while True:
                event = await queue.get()
                event_name = event.get("event", "message")
                data_str = json.dumps(event)
                yield f"event: {event_name}\ndata: {data_str}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            self.unsubscribe(workflow_id, queue)


event_broadcaster = SSEEventBroadcaster()
