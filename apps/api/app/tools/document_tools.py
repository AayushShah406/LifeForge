from typing import Any, Dict, List, Optional
from app.tools.base import BaseTool, ToolResult


class DocumentSearchTool(BaseTool):
    name = "document_search"
    description = "Retrieve relevant chunks and entities from user uploaded documents (PDF, DOCX, TXT) stored in Weaviate vector database with strict multi-tenant user isolation."
    is_sensitive = False
    allowed_agents = ["document", "research", "interview", "supervisor"]

    parameters_schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Semantic search query for document chunks"},
            "document_type": {"type": "string", "description": "Optional filter: 'resume', 'job_description', 'notes'"},
            "top_k": {"type": "integer", "description": "Number of top matching chunks to return", "default": 4}
        },
        "required": ["query"]
    }

    async def execute(self, user_id: str, **kwargs) -> ToolResult:
        query = kwargs.get("query", "")
        document_type = kwargs.get("document_type")
        top_k = kwargs.get("top_k", 4)

        if not query:
            return ToolResult(tool_name=self.name, status="error", error="Empty query provided")

        # In a full run, this delegates to WeaviateService.search_chunks
        from app.rag.weaviate_service import weaviate_service
        chunks = await weaviate_service.search_chunks(
            user_id=user_id,
            query=query,
            document_type=document_type,
            top_k=top_k
        )

        return ToolResult(
            tool_name=self.name,
            status="success",
            data={
                "query": query,
                "matches": [c.model_dump() for c in chunks],
                "match_count": len(chunks)
            }
        )
