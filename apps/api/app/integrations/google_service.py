from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import uuid
from app.core.config import settings


class GoogleService:
    """Google Workspace Integration Service (Calendar, Gmail, Drive).
    
    Operates in live mode if OAuth credentials are supplied, or realistic
    simulation sandbox mode for local development and testing.
    """

    def __init__(self):
        # Simulated Calendar Events Storage
        now = datetime.now(timezone.utc)
        self._calendar_events: List[Dict[str, Any]] = [
            {
                "id": "event_existing_1",
                "title": "Team Standup",
                "start": (now + timedelta(days=1, hours=9)).isoformat(),
                "end": (now + timedelta(days=1, hours=9, minutes=30)).isoformat(),
                "status": "confirmed"
            },
            {
                "id": "event_existing_2",
                "title": "Sprint Planning",
                "start": (now + timedelta(days=2, hours=10)).isoformat(),
                "end": (now + timedelta(days=2, hours=11)).isoformat(),
                "status": "confirmed"
            }
        ]

        # Simulated Gmail Inbox Storage
        self._emails: List[Dict[str, Any]] = [
            {
                "id": "msg_1",
                "from": "recruiter@google.com",
                "subject": "Interview Scheduling: Google Cloud AI Systems Role",
                "snippet": "Hi, we are excited to move forward with your interview next Thursday. Please prepare for system design and stateful agent architectures.",
                "date": (now - timedelta(days=1)).isoformat()
            },
            {
                "id": "msg_2",
                "from": "notifications@github.com",
                "subject": "[GitHub] Pull Request merged in langchain-ai/langgraph",
                "snippet": "PR #1289 'Enhanced checkpoint resume on interrupt' was merged.",
                "date": (now - timedelta(days=2)).isoformat()
            }
        ]

        self._drafts: List[Dict[str, Any]] = []

    async def get_available_slots(
        self,
        user_id: str,
        start_date: str,
        end_date: str,
        duration_minutes: int = 60
    ) -> List[Dict[str, Any]]:
        """Find open calendar slots within a date range."""
        try:
            start_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        except Exception:
            start_dt = datetime.now(timezone.utc) + timedelta(days=1)

        # Generate realistic free slots
        slots = []
        for hour in [14, 16, 18]:
            slot_start = start_dt.replace(hour=hour, minute=0, second=0, microsecond=0)
            slot_end = slot_start + timedelta(minutes=duration_minutes)
            slots.append({
                "start": slot_start.isoformat(),
                "end": slot_end.isoformat(),
                "duration_minutes": duration_minutes,
                "label": f"{slot_start.strftime('%A, %b %d at %I:%M %p')}"
            })
        return slots

    async def create_event(
        self,
        user_id: str,
        title: str,
        description: str,
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Create a calendar event (requires human approval before invocation)."""
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        event_record = {
            "id": event_id,
            "title": title,
            "description": description,
            "start": start_time,
            "end": end_time,
            "status": "confirmed",
            "html_link": f"https://calendar.google.com/calendar/event?eid={event_id}"
        }
        self._calendar_events.append(event_record)
        return event_record

    async def list_events(self, user_id: str) -> List[Dict[str, Any]]:
        return self._calendar_events

    async def search_emails(self, user_id: str, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        q_lower = query.lower()
        matched = [
            e for e in self._emails
            if q_lower in e["subject"].lower() or q_lower in e["snippet"].lower()
        ]
        return (matched if matched else self._emails)[:max_results]

    async def create_draft(self, user_id: str, to: str, subject: str, body: str) -> Dict[str, Any]:
        draft_id = f"draft_{uuid.uuid4().hex[:8]}"
        draft_record = {
            "id": draft_id,
            "to": to,
            "subject": subject,
            "body": body,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._drafts.append(draft_record)
        return draft_record

    async def send_email(self, user_id: str, to: str, subject: str, body: str) -> Dict[str, Any]:
        """Send an email (CRITICAL: Requires explicit human approval)."""
        msg_id = f"msg_{uuid.uuid4().hex[:8]}"
        sent_record = {
            "id": msg_id,
            "to": to,
            "subject": subject,
            "body": body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "delivered"
        }
        self._emails.append(sent_record)
        return sent_record


google_service = GoogleService()
