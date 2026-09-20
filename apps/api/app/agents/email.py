"""Email Agent (Section 24).

Handles email search, inbox summarization, action item extraction, and email drafting.
Crucial Rule: Sending an email REQUIRES explicit Human-in-the-Loop approval.
"""
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.llm.router import get_fast_model

logger = logging.getLogger("lifeforge.agents.email")


class EmailDraft(BaseModel):
    recipient: str = Field(description="Recipient email address")
    subject: str = Field(description="Subject line of the email")
    body: str = Field(description="Full text body of the drafted email")
    cc: List[str] = Field(default_factory=list)
    requires_approval: bool = Field(default=True, description="Always True for outbound email dispatch")


class EmailActionItem(BaseModel):
    sender: str
    subject: str
    extracted_action: str
    urgency: str = "medium"


class EmailAgent:
    """Specialized agent for searching, reading, summarizing, and drafting emails."""

    def __init__(self):
        self.fast_llm = get_fast_model()

    async def draft_followup_email(
        self,
        interviewer_name: str,
        company: str,
        role: str,
        highlights: List[str]
    ) -> EmailDraft:
        """Drafts an interview thank-you or confirmation email. Sending requires human approval."""
        prompt = f"""Draft a professional, concise email following an interview or planning discussion.
Interviewer: {interviewer_name}
Company: {company}
Role: {role}
Key Discussion Highlights:
{chr(10).join(f'- {h}' for h in highlights)}

Return a structured draft with recipient, subject, and body.
"""
        response = await self.fast_llm.generate(
            prompt=prompt,
            system_instruction="You are an executive communication assistant. Draft clear, polite, and technically sharp communications.",
            response_schema=EmailDraft
        )

        if response.structured and isinstance(response.structured, EmailDraft):
            draft = response.structured
            draft.requires_approval = True
            return draft

        return EmailDraft(
            recipient="recruiter@company.com",
            subject=f"Thank You — Interview for {role} at {company}",
            body=f"Dear {interviewer_name},\n\nThank you for taking the time to speak with me today about the {role} position at {company}. I enjoyed our discussion regarding stateful agent systems and LangGraph orchestration.\n\nBest regards,\nAlex Chen",
            requires_approval=True
        )


email_agent = EmailAgent()
