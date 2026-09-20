import pytest
import os
import tempfile
from app.rag.parser import DocumentParser
from app.rag.chunker import DocumentChunker
from app.rag.embeddings import embedding_service
from app.rag.retrieval import document_retriever


def test_document_parser_text():
    """Verify DocumentParser correctly parses plain text."""
    sample_text = "LifeForge is an agentic personal operations platform.\nIt turns goals into verified actions."
    pages = DocumentParser.parse_text(sample_text, filename="notes.txt")
    assert len(pages) == 1
    page_num, text = pages[0]
    assert "LifeForge" in text
    assert page_num == 1


def test_document_chunker_splitting():
    """Verify DocumentChunker chunks documents with appropriate metadata."""
    chunker = DocumentChunker(chunk_size=10, chunk_overlap=2)
    pages = [
        (1, "This is a detailed paragraph explaining how agentic workflows operate in production systems. " * 5)
    ]
    chunks = chunker.chunk_document(
        document_id="doc_123",
        user_id="user_456",
        filename="resume.pdf",
        document_type="resume",
        pages=pages
    )

    assert len(chunks) > 1
    for c in chunks:
        assert c["document_id"] == "doc_123"
        assert c["user_id"] == "user_456"
        assert c["source"] == "resume.pdf"
        assert c["document_type"] == "resume"
        assert len(c["content"]) > 0


@pytest.mark.asyncio
async def test_embedding_service_dimension():
    """Verify embedding service generates 768-dimensional dense vector embeddings."""
    vector = await embedding_service.get_embedding("Explain the difference between LangGraph and LangChain.")
    assert isinstance(vector, list)
    assert len(vector) == 768
    assert all(isinstance(val, float) for val in vector)


@pytest.mark.asyncio
async def test_retriever_formatted_context():
    """Verify retriever formats chunk results into structured context block."""
    context = await document_retriever.get_formatted_context(
        user_id="user_test",
        query="experience with distributed systems"
    )
    assert isinstance(context, str)
