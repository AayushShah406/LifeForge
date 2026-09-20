"""Model Context Protocol (MCP) Tool Schemas conforming to the standard specification."""

MCP_TOOL_SCHEMAS = [
    {
        "name": "web_search",
        "description": "Execute web search to gather real-time public information with verified citations and source confidence.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "num_results": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        },
        "isSensitive": False
    },
    {
        "name": "document_search",
        "description": "Semantic search across uploaded user documents (PDF, DOCX) in Weaviate vector database with strict multi-tenant isolation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Query to match document chunks"},
                "document_type": {"type": "string", "description": "Optional filter: resume, job_description"},
                "top_k": {"type": "integer", "default": 4}
            },
            "required": ["query"]
        },
        "isSensitive": False
    },
    {
        "name": "memory_search",
        "description": "Search long-term semantic user memory in Weaviate for past decisions, user preferences, and recurring goals.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Query to search memory"},
                "memory_type": {"type": "string", "description": "Optional filter: preference, fact, decision"},
                "top_k": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        },
        "isSensitive": False
    },
    {
        "name": "calendar_availability",
        "description": "Read Google Calendar schedule and discover open slots for meetings, prep sessions, or tasks.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "ISO start date"},
                "end_date": {"type": "string", "description": "ISO end date"},
                "duration_minutes": {"type": "integer", "default": 60}
            },
            "required": ["start_date", "end_date"]
        },
        "isSensitive": False
    },
    {
        "name": "calendar_create_event",
        "description": "Schedule a new event on Google Calendar. SENSITIVE: Requires explicit human confirmation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Event title"},
                "description": {"type": "string", "description": "Event description"},
                "start_time": {"type": "string", "description": "ISO start time"},
                "end_time": {"type": "string", "description": "ISO end time"}
            },
            "required": ["title", "start_time", "end_time"]
        },
        "isSensitive": True
    },
    {
        "name": "email_send",
        "description": "Send an email message via Gmail. SENSITIVE: Requires explicit human sign-off.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email"},
                "subject": {"type": "string", "description": "Subject"},
                "body": {"type": "string", "description": "Body message"}
            },
            "required": ["to", "subject", "body"]
        },
        "isSensitive": True
    },
    {
        "name": "task_create",
        "description": "Deterministically record a new user task or study session in PostgreSQL.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title"},
                "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"], "default": "medium"},
                "estimated_duration_minutes": {"type": "integer", "default": 30}
            },
            "required": ["title"]
        },
        "isSensitive": False
    }
]
