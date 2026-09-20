"""VectorStoreService abstraction for Weaviate Cloud (Sections 96-102).

Enforces:
- Automatic user_id filtering for multi-tenancy isolation
- Integration with Gemini Embeddings
- Standardized document, memory, and knowledge retrieval
- Vector lifecycle management
"""
import logging
from typing import Any, Dict, List, Optional

from app.rag.weaviate_client import weaviate_client
from app.rag.embeddings import generate_query_embedding

logger = logging.getLogger("lifeforge.vectorstore_service")


class VectorStoreService:
    """Production vector service layer wrapping Weaviate Cloud client."""

    def __init__(self):
        self.client = weaviate_client

    async def connect(self) -> bool:
        return await self.client.connect()

    async def ensure_collections(self) -> None:
        await self.client.ensure_collections()

    # --------------------------------------------------------------------------
    # Document Chunks
    # --------------------------------------------------------------------------
    async def search_documents(
        self,
        user_id: str,
        query: str,
        limit: int = 10,
        document_type: Optional[str] = None,
        document_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Search DocumentChunk collection with query embedding and user isolation."""
        query_vector = await generate_query_embedding(query)
        results = await self.client.search_document_chunks(
            user_id=user_id,
            query_vector=query_vector,
            document_type=document_type,
            document_id=document_id,
            top_k=limit
        )
        return [r.model_dump() for r in results]

    async def insert_document_chunk(
        self,
        user_id: str,
        document_id: str,
        chunk_id: str,
        content: str,
        embedding: List[float],
        document_type: str = "general",
        filename: str = "",
        page_number: int = 1,
        section: str = "",
        source: str = ""
    ) -> int:
        return await self.client.insert_document_chunks([{
            "user_id": user_id,
            "document_id": document_id,
            "chunk_id": chunk_id,
            "content": content,
            "embedding": embedding,
            "document_type": document_type,
            "filename": filename,
            "page_number": page_number,
            "section": section,
            "source": source
        }])

    async def delete_document_vectors(self, document_id: str, user_id: str) -> bool:
        return await self.client.delete_document_vectors(document_id, user_id)

    # --------------------------------------------------------------------------
    # Semantic Memory
    # --------------------------------------------------------------------------
    async def search_memories(
        self,
        user_id: str,
        query: str,
        limit: int = 5,
        memory_type: Optional[str] = None,
        min_importance: float = 0.4,
        **kwargs: Any
    ) -> List[Dict[str, Any]]:
        """Search SemanticMemory collection with query embedding and user isolation."""
        query_vector = await generate_query_embedding(query)
        memories = await self.client.search_memories(
            user_id=user_id,
            query_vector=query_vector,
            memory_type=memory_type,
            top_k=limit,
            min_importance=min_importance
        )
        return [m.model_dump() for m in memories]

    async def insert_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str = "preference",
        importance: float = 0.8,
        confidence: float = 0.9,
        source: str = "workflow"
    ) -> Dict[str, Any]:
        vector = await generate_query_embedding(content)
        item = await self.client.insert_memory(
            user_id=user_id,
            content=content,
            vector=vector,
            memory_type=memory_type,
            importance=importance,
            confidence=confidence,
            source=source
        )
        return item.model_dump()

    async def delete_memory(self, memory_id: str, user_id: str) -> bool:
        return await self.client.delete_memory(memory_id, user_id)

    # --------------------------------------------------------------------------
    # Knowledge Items
    # --------------------------------------------------------------------------
    async def search_knowledge(
        self,
        user_id: str,
        query: str,
        limit: int = 10,
        knowledge_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search KnowledgeItem collection with query embedding and user isolation."""
        query_vector = await generate_query_embedding(query)
        return await self.client.search_knowledge(
            user_id=user_id,
            query_vector=query_vector,
            knowledge_type=knowledge_type,
            top_k=limit
        )

    async def insert_knowledge(
        self,
        user_id: str,
        content: str,
        knowledge_type: str = "research",
        title: str = "Knowledge Item",
        source: str = "agent",
        source_url: Optional[str] = None,
        confidence: float = 0.9
    ) -> Dict[str, Any]:
        vector = await generate_query_embedding(content)
        return await self.client.insert_knowledge(
            user_id=user_id,
            content=content,
            vector=vector,
            knowledge_type=knowledge_type,
            source=source,
            source_url=source_url,
            title=title,
            confidence=confidence
        )

    # --------------------------------------------------------------------------
    # Health Check
    # --------------------------------------------------------------------------
    async def health_check(self) -> Dict[str, Any]:
        return await self.client.health_check()


# Global singleton instance
vector_store_service = VectorStoreService()
