import logging
from typing import Any, Dict, List, Optional
from app.rag.embeddings import embedding_service
from app.rag.weaviate_client import weaviate_client
from app.schemas.document import DocumentChunkSchema

logger = logging.getLogger("lifeforge.retrieval")


class DocumentRetriever:
    """Retrieves relevant document chunks from Weaviate with user-level isolation."""

    def __init__(self):
        self.weaviate = weaviate_client

    async def retrieve_chunks(
        self,
        user_id: str,
        query: str,
        document_type: Optional[str] = None,
        top_k: int = 4
    ) -> List[DocumentChunkSchema]:
        """Perform dense vector retrieval against user's indexed documents."""
        query_vector = await embedding_service.get_embedding(query)
        chunks = await self.weaviate.search_document_chunks(
            user_id=user_id,
            query_vector=query_vector,
            document_type=document_type,
            top_k=top_k
        )
        return chunks

    async def retrieve(
        self,
        query: str,
        user_id: str,
        top_k: int = 5,
        document_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Convenience retrieval returning dictionaries with chunk contents and metadata."""
        chunks = await self.retrieve_chunks(
            user_id=user_id,
            query=query,
            document_type=document_type,
            top_k=top_k
        )
        return [
            {
                "chunk_id": c.chunk_id,
                "document_id": c.document_id,
                "content": c.content,
                "document_type": c.document_type,
                "source": c.source,
                "page_number": c.page_number,
                "score": c.score
            }
            if hasattr(c, "chunk_id") else c
            for c in chunks
        ]

    async def get_formatted_context(
        self,
        user_id: str,
        query: str,
        document_type: Optional[str] = None,
        top_k: int = 4
    ) -> str:
        """Retrieves and formats chunks into a context string for agents."""
        chunks = await self.retrieve_chunks(
            user_id=user_id,
            query=query,
            document_type=document_type,
            top_k=top_k
        )
        if not chunks:
            return "No relevant documents found."

        snippets = []
        for i, c in enumerate(chunks):
            header = f"[Doc: {c.source} (Page {c.page_number}) - Type: {c.document_type}]"
            snippets.append(f"{header}\n{c.content}")

        return "\n\n---\n\n".join(snippets)


document_retriever = DocumentRetriever()
retrieval_service = document_retriever
context_retriever = document_retriever

__all__ = [
    "DocumentRetriever",
    "document_retriever",
    "retrieval_service",
    "context_retriever"
]
