from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid
from app.tools.base import BaseTool, ToolResult
from app.database import async_session_factory, Task


class TaskCreateTool(BaseTool):
    name = "task_create"
    description = "Create a structured, deterministic task with title, priority, due date, and duration."
    is_sensitive = False
    allowed_agents = ["planning", "interview", "supervisor"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Title of the task"},
            "description": {"type": "string", "description": "Detailed checklist or task notes"},
            "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"], "default": "medium"},
            "due_date": {"type": "string", "description": "ISO datetime string for deadline"},
            "estimated_duration_minutes": {"type": "integer", "default": 30},
            "workflow_id": {"type": "string"}
        },
        "required": ["title"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        title = kwargs.get("title")
        description = kwargs.get("description", "")
        priority = kwargs.get("priority", "medium")
        due_date_str = kwargs.get("due_date")
        workflow_id = kwargs.get("workflow_id")
        duration = kwargs.get("estimated_duration_minutes", 30)

        due_date = None
        if due_date_str:
            try:
                due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
            except Exception:
                due_date = None

        task_id = str(uuid.uuid4())
        async with async_session_factory() as session:
            new_task = Task(
                id=task_id,
                user_id=user_id,
                workflow_id=workflow_id,
                title=title,
                description=description,
                priority=priority,
                due_date=due_date,
                estimated_duration_minutes=duration,
                status="pending"
            )
            session.add(new_task)
            await session.commit()

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={"task_id": task_id, "title": title, "status": "created"}
        )


class TaskListTool(BaseTool):
    name = "task_list"
    description = "List existing pending or active tasks for the user to plan dependencies."
    is_sensitive = False
    allowed_agents = ["planning", "supervisor"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "status": {"type": "string", "default": "pending"},
            "limit": {"type": "integer", "default": 10}
        }
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        from sqlalchemy import select
        limit = kwargs.get("limit", 10)
        status = kwargs.get("status", "pending")

        async with async_session_factory() as session:
            stmt = select(Task).where(Task.user_id == user_id)
            if status != "all":
                stmt = stmt.where(Task.status == status)
            stmt = stmt.limit(limit)
            result = await session.execute(stmt)
            tasks = result.scalars().all()

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={
                "tasks": [
                    {
                        "id": t.id,
                        "title": t.title,
                        "priority": t.priority,
                        "status": t.status,
                        "due_date": t.due_date.isoformat() if t.due_date else None
                    }
                    for t in tasks
                ],
                "count": len(tasks)
            }
        )
