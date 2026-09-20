import logging
import os
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select

from app.rag.parser import DocumentParser
from app.rag.chunker import DocumentChunker
from app.rag.embeddings import embedding_service
from app.rag.weaviate_client import weaviate_client
from app.database.session import async_session_factory
from app.database.models import Document, DocumentChunk

logger = logging.getLogger("lifeforge.ingestion")


class DocumentIngestionPipeline:
    """Full ingestion pipeline: parsing, chunking, embedding generation, and Weaviate insertion (Section 7, 93)."""

    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunker = DocumentChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.weaviate = weaviate_client

    async def ingest_document(
        self,
        file_path: str,
        filename: str,
        document_id: str,
        user_id: str,
        document_type: str = "general"
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Ingests a file from disk into embedded vector chunks with PostgreSQL metadata tracking."""
        pages = DocumentParser.parse_file(file_path=file_path, filename=filename)
        logger.info(f"Parsed {len(pages)} page(s)/section(s) from {filename}")

        chunks = self.chunker.chunk_document(
            document_id=document_id,
            user_id=user_id,
            filename=filename,
            document_type=document_type,
            pages=pages
        )
        logger.info(f"Created {len(chunks)} chunks for {filename}")

        for c in chunks:
            vector = await embedding_service.get_embedding(c["content"])
            c["embedding"] = vector

        if self.weaviate.is_connected():
            await self.weaviate.insert_document_chunks(chunks)

        # Update or record metadata in PostgreSQL
        try:
            async with async_session_factory() as session:
                doc_stmt = select(Document).where(Document.id == document_id)
                doc_res = await session.execute(doc_stmt)
                doc = doc_res.scalar_one_or_none()
                if doc:
                    doc.status = "indexed"
                    doc.page_count = len(pages)
                    doc.chunk_count = len(chunks)
                    for c in chunks:
                        chunk_rec = DocumentChunk(
                            document_id=document_id,
                            user_id=user_id,
                            chunk_id=c.get("chunk_id", ""),
                            page_number=c.get("page_number", 1),
                            section=c.get("section", ""),
                            weaviate_object_id=c.get("chunk_id", "")
                        )
                        session.add(chunk_rec)
                    await session.commit()
        except Exception as e:
            logger.debug(f"Document metadata persistence note: {e}")

        return chunks, len(pages)

    async def ingest_file(
        self,
        file_path: str,
        user_id: str,
        document_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Convenience ingestion entrypoint accepting file_path and user_id."""
        meta = metadata or {}
        filename = meta.get("original_filename") or os.path.basename(file_path)
        doc_type = meta.get("category", "general")
        chunks, pages_count = await self.ingest_document(
            file_path=file_path,
            filename=filename,
            document_id=document_id,
            user_id=user_id,
            document_type=doc_type
        )
        return {
            "document_id": document_id,
            "filename": filename,
            "chunks_count": len(chunks),
            "pages_count": pages_count,
            "status": "indexed"
        }


document_ingestion_pipeline = DocumentIngestionPipeline()
ingestion_pipeline = document_ingestion_pipeline

__all__ = [
    "DocumentIngestionPipeline",
    "document_ingestion_pipeline",
    "ingestion_pipeline"
]
