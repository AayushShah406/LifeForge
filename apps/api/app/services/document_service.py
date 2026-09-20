import logging
import os
import shutil
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import async_session_factory
from app.database.models import Document
from app.rag.ingestion import ingestion_pipeline
from app.rag.retrieval import retrieval_service
from app.rag.weaviate_client import weaviate_client

logger = logging.getLogger("lifeforge.services.document")

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


class DocumentService:
    """Document lifecycle management, ingestion triggering, and hybrid retrieval."""

    @staticmethod
    async def process_uploaded_file(
        user_id: str,
        filename: str,
        file_bytes: bytes,
        category: Optional[str] = "general"
    ) -> Document:
        """Saves file to disk, persists Document DB record, and processes through RAG pipeline."""
        doc_id = str(uuid.uuid4())
        ext = os.path.splitext(filename)[1].lower().replace(".", "") or "txt"
        stored_filename = f"{doc_id}_{filename}"
        dest_path = os.path.join(UPLOAD_DIR, stored_filename)

        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        file_size = len(file_bytes)

        async with async_session_factory() as session:
            doc = Document(
                id=doc_id,
                user_id=user_id,
                filename=filename,
                file_type=ext,
                file_size_bytes=file_size,
                file_path=dest_path,
                status="processing",
                chunk_count=0,
                extracted_entities={"category": category}
            )
            session.add(doc)
            await session.commit()
            await session.refresh(doc)

        try:
            result = await ingestion_pipeline.ingest_file(
                file_path=dest_path,
                user_id=user_id,
                document_id=doc_id,
                metadata={"category": category, "original_filename": filename}
            )
            async with async_session_factory() as session:
                stmt = select(Document).where(Document.id == doc_id)
                res = await session.execute(stmt)
                updated_doc = res.scalar_one_or_none()
                if updated_doc:
                    updated_doc.status = "processed"
                    updated_doc.chunk_count = result.get("chunks_count", 0)
                    updated_doc.summary = f"Processed {result.get('chunks_count', 0)} chunks successfully."
                    await session.commit()
                    await session.refresh(updated_doc)
                    return updated_doc
        except Exception as e:
            logger.error(f"Failed to ingest document {doc_id}: {e}", exc_info=True)
            async with async_session_factory() as session:
                stmt = select(Document).where(Document.id == doc_id)
                res = await session.execute(stmt)
                updated_doc = res.scalar_one_or_none()
                if updated_doc:
                    updated_doc.status = "failed"
                    updated_doc.summary = f"Ingestion error: {str(e)}"
                    await session.commit()
                    await session.refresh(updated_doc)
                    return updated_doc

        return doc

    @staticmethod
    async def list_documents(user_id: str, limit: int = 50) -> List[Document]:
        """Lists uploaded documents for a user."""
        async with async_session_factory() as session:
            stmt = (
                select(Document)
                .where(Document.user_id == user_id)
                .order_by(desc(Document.created_at))
                .limit(limit)
            )
            res = await session.execute(stmt)
            return list(res.scalars().all())

    @staticmethod
    async def get_document(document_id: str, user_id: str) -> Optional[Document]:
        """Retrieves a document record by ID."""
        async with async_session_factory() as session:
            stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
            res = await session.execute(stmt)
            return res.scalar_one_or_none()

    @staticmethod
    async def delete_document(document_id: str, user_id: str) -> bool:
        """Deletes document record and associated file."""
        async with async_session_factory() as session:
            stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
            res = await session.execute(stmt)
            doc = res.scalar_one_or_none()
            if not doc:
                return False

            if doc.file_path and os.path.exists(doc.file_path):
                try:
                    os.remove(doc.file_path)
                except Exception:
                    pass

            await session.delete(doc)
            await session.commit()
            return True

    @staticmethod
    async def search(user_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Semantic search against user's ingested document chunks."""
        return await retrieval_service.retrieve(query=query, user_id=user_id, top_k=top_k)


document_service = DocumentService()
