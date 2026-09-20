from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone
from app.tools.base import BaseTool, ToolResult
from app.integrations.google_service import google_service


class CalendarAvailabilityTool(BaseTool):
    name = "calendar_availability"
    description = "Check user availability on Google Calendar for a date range to find open slots for study or mock interviews."
    is_sensitive = False
    allowed_agents = ["planning", "interview", "supervisor"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "start_date": {"type": "string", "description": "ISO start datetime e.g. 2026-09-24T09:00:00Z"},
            "end_date": {"type": "string", "description": "ISO end datetime e.g. 2026-09-24T18:00:00Z"},
            "duration_minutes": {"type": "integer", "description": "Required slot duration in minutes", "default": 60}
        },
        "required": ["start_date", "end_date"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        start_date = kwargs.get("start_date")
        end_date = kwargs.get("end_date")
        duration_minutes = kwargs.get("duration_minutes", 60)

        slots = await google_service.get_available_slots(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            duration_minutes=duration_minutes
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={
                "available_slots": slots,
                "count": len(slots)
            }
        )


class CalendarCreateEventTool(BaseTool):
    name = "calendar_create_event"
    description = "Create a new event on Google Calendar. SENSITIVE: Always requires explicit human approval before execution."
    is_sensitive = True
    allowed_agents = ["planning", "interview"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Event title e.g. 'Interview Prep: System Design'"},
            "description": {"type": "string", "description": "Details, agenda, questions or meeting link"},
            "start_time": {"type": "string", "description": "ISO start datetime"},
            "end_time": {"type": "string", "description": "ISO end datetime"}
        },
        "required": ["title", "start_time", "end_time"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        # If not already approved by user in LangGraph interrupt, return requires_approval
        is_approved = kwargs.get("__human_approved__", False)
        title = kwargs.get("title", "Event")
        start_time = kwargs.get("start_time")
        end_time = kwargs.get("end_time")
        description = kwargs.get("description", "")

        if not is_approved:
            return ToolResult(
                tool_name=self.name,
                status="requires_approval",
                requires_approval=True,
                approval_payload={
                    "action_type": "calendar_create",
                    "title": f"Create Calendar Event: {title}",
                    "description": f"Schedule '{title}' from {start_time} to {end_time}",
                    "payload": {
                        "title": title,
                        "description": description,
                        "start_time": start_time,
                        "end_time": end_time
                    }
                }
            )

        # Execute approved mutation
        event = await google_service.create_event(
            user_id=user_id,
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={
                "event_id": event["id"],
                "html_link": event["html_link"],
                "status": "confirmed"
            }
        )
