import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException

logger = logging.getLogger("lifeforge.tools_mcp")

router = APIRouter(prefix="/tools", tags=["MCP Tools & Integrations"])

MOCK_MCP_SERVERS = [
    {
        "id": "mcp_core",
        "name": "LifeForge Core MCP Server",
        "protocol": "Model Context Protocol (JSON-RPC 2.0)",
        "endpoint": "http://localhost:8001/mcp/core",
        "status": "connected",
        "tools_count": 4,
        "tools": ["web_search", "document_search", "memory_search", "task_create"]
    },
    {
        "id": "mcp_google",
        "name": "Google Workspace MCP Server",
        "protocol": "Model Context Protocol (JSON-RPC 2.0)",
        "endpoint": "http://localhost:8001/mcp/google",
        "status": "connected",
        "tools_count": 2,
        "tools": ["calendar_create_event", "email_send_summary"]
    }
]

MOCK_TOOL_DETAILS = {
    "web_search": {
        "name": "web_search",
        "description": "Search external web sources for up-to-date industry information.",
        "server": "LifeForge Core MCP",
        "permission": "Read",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        },
        "calls_total": 350,
        "success_rate": "98.2%",
        "recent_calls": [
            {"query": "Anthropic AI Systems engineer expectations 2026", "latency_ms": 340, "status": "success"},
            {"query": "Google TPU v5 vs H100 distributed training architectures", "latency_ms": 420, "status": "success"}
        ]
    },
    "document_search": {
        "name": "document_search",
        "description": "Perform dense vector similarity search across indexed PDF/DOCX documents in Weaviate Cloud.",
        "server": "LifeForge Core MCP",
        "permission": "Read",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "document_type": {"type": "string", "enum": ["resume", "job_description", "notes", "all"]}
            },
            "required": ["query"]
        },
        "calls_total": 412,
        "success_rate": "99.5%",
        "recent_calls": [
            {"query": "Candidate distributed systems experience", "latency_ms": 110, "status": "success"},
            {"query": "Job description mandatory qualification", "latency_ms": 98, "status": "success"}
        ]
    },
    "calendar_create_event": {
        "name": "calendar_create_event",
        "description": "Schedule a preparation session or interview block on Google Calendar. Requires human sign-off.",
        "server": "Google Workspace MCP",
        "permission": "External Mutation (Requires Human Approval)",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "start_time": {"type": "string", "format": "date-time"},
                "end_time": {"type": "string", "format": "date-time"},
                "description": {"type": "string"}
            },
            "required": ["title", "start_time", "end_time"]
        },
        "calls_total": 45,
        "success_rate": "100.0%",
        "recent_calls": [
            {"title": "System Design Mock Interview", "latency_ms": 220, "status": "success"}
        ]
    }
}


@router.get("/mcp")
async def list_mcp_servers_and_tools() -> Dict[str, Any]:
    """List registered MCP servers and available tools."""
    return {
        "servers": MOCK_MCP_SERVERS,
        "total_tools": 6,
        "tools_summary": [
            {"name": "web_search", "server": "lifeforge-core", "status": "Connected ✓", "permission": "Read"},
            {"name": "document_search", "server": "lifeforge-core", "status": "Connected ✓", "permission": "Read"},
            {"name": "memory_search", "server": "lifeforge-core", "status": "Connected ✓", "permission": "Read"},
            {"name": "calendar_create_event", "server": "lifeforge-google", "status": "Connected ✓", "permission": "Approval Required"},
            {"name": "email_send_summary", "server": "lifeforge-google", "status": "Connected ✓", "permission": "Approval Required"},
            {"name": "task_create", "server": "lifeforge-core", "status": "Connected ✓", "permission": "Write"}
        ]
    }


@router.get("/mcp/{tool_name}")
async def get_tool_detail(tool_name: str) -> Dict[str, Any]:
    """Retrieve detailed specification and call history for a specific MCP tool."""
    detail = MOCK_TOOL_DETAILS.get(tool_name)
    if not detail:
        # Generic fallback
        return {
            "name": tool_name,
            "description": f"MCP tool '{tool_name}' for autonomous agent operations.",
            "server": "LifeForge Core MCP",
            "permission": "Read/Execute",
            "input_schema": {"type": "object", "properties": {"input": {"type": "string"}}},
            "calls_total": 52,
            "success_rate": "99.0%",
            "recent_calls": []
        }
    return detail
