from typing import Any, Dict, List, Optional
from app.tools.base import BaseTool, ToolResult
from app.integrations.google_service import google_service


class EmailSearchTool(BaseTool):
    name = "email_search"
    description = "Search Gmail messages for interview invitations, recruiter communications, or project updates."
    is_sensitive = False
    allowed_agents = ["supervisor", "interview", "planning"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Gmail query syntax e.g. 'interview from:recruiter'"},
            "max_results": {"type": "integer", "default": 5}
        },
        "required": ["query"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        query = kwargs.get("query", "")
        max_results = kwargs.get("max_results", 5)

        emails = await google_service.search_emails(
            user_id=user_id,
            query=query,
            max_results=max_results
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={"emails": emails, "count": len(emails)}
        )


class EmailDraftTool(BaseTool):
    name = "email_draft"
    description = "Create a draft email reply or preparation briefing in Gmail. Does not send the email."
    is_sensitive = False
    allowed_agents = ["interview", "planning"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "Recipient email"},
            "subject": {"type": "string", "description": "Subject line"},
            "body": {"type": "string", "description": "Draft body text"}
        },
        "required": ["to", "subject", "body"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        to = kwargs.get("to")
        subject = kwargs.get("subject")
        body = kwargs.get("body")

        draft = await google_service.create_draft(
            user_id=user_id,
            to=to,
            subject=subject,
            body=body
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={"draft_id": draft["id"], "status": "draft_created"}
        )


class EmailSendTool(BaseTool):
    name = "email_send"
    description = "Send an email via Gmail. CRITICAL: NEVER executes without explicit human approval."
    is_sensitive = True
    allowed_agents = ["interview", "planning"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "Recipient email"},
            "subject": {"type": "string", "description": "Subject line"},
            "body": {"type": "string", "description": "Body message"}
        },
        "required": ["to", "subject", "body"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        is_approved = kwargs.get("__human_approved__", False)
        to = kwargs.get("to")
        subject = kwargs.get("subject")
        body = kwargs.get("body")

        if not is_approved:
            return ToolResult(
                tool_name=self.name,
                status="requires_approval",
                requires_approval=True,
                approval_payload={
                    "action_type": "email_send",
                    "title": f"Send Email to {to}",
                    "description": f"Subject: '{subject}'\n\nPreview:\n{body[:200]}...",
                    "payload": {"to": to, "subject": subject, "body": body}
                }
            )

        sent_msg = await google_service.send_email(
            user_id=user_id,
            to=to,
            subject=subject,
            body=body
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={"message_id": sent_msg["id"], "status": "sent"}
        )
