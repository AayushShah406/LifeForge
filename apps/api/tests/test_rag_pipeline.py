import pytest
from app.rag.chunker import DocumentChunker
from app.rag.weaviate_service import weaviate_service


@pytest.mark.asyncio
async def test_chunker_metadata_preservation():
    """Verify chunker preserves page numbers and source filenames."""
    chunker = DocumentChunker(chunk_size=50, chunk_overlap=10)
    pages = [
        (1, "Senior AI Systems Engineer with 6 years experience in LangGraph and distributed LLMs."),
        (2, "Proficient in Weaviate vector database, hybrid search, and FastAPI backends.")
    ]

    chunks = chunker.chunk_document(
        document_id="doc_1",
        user_id="user_alice",
        filename="resume.pdf",
        document_type="resume",
        pages=pages
    )

    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["source"] == "resume.pdf"
    assert chunks[1]["page_number"] == 2


@pytest.mark.asyncio
async def test_weaviate_multi_tenant_isolation():
    """Verify strict user isolation: User Bob cannot retrieve User Alice's chunks."""
    chunk_alice = [{
        "chunk_id": "chunk_alice_1",
        "document_id": "doc_alice",
        "user_id": "user_alice",
        "content": "Confidential salary expectation and private project architecture.",
        "document_type": "resume",
        "source": "alice_resume.pdf",
        "page_number": 1
    }]
    chunk_bob = [{
        "chunk_id": "chunk_bob_1",
        "document_id": "doc_bob",
        "user_id": "user_bob",
        "content": "Public portfolio of open source projects and blog posts.",
        "document_type": "resume",
        "source": "bob_resume.pdf",
        "page_number": 1
    }]

    await weaviate_service.insert_chunks(chunk_alice)
    await weaviate_service.insert_chunks(chunk_bob)

    # Bob searches for salary
    bob_results = await weaviate_service.search_chunks(
        user_id="user_bob",
        query="salary expectation confidential"
    )
    # Alice's chunk must NOT be returned to Bob
    for r in bob_results:
        assert r.user_id == "user_bob"
        assert "alice" not in r.document_id

    # Alice searches for salary
    alice_results = await weaviate_service.search_chunks(
        user_id="user_alice",
        query="salary expectation"
    )
    assert any(r.user_id == "user_alice" for r in alice_results)


@pytest.mark.asyncio
async def test_document_parser_formats(tmp_path):
    """Verify DocumentParser successfully parses TXT, Markdown, and handles fallbacks."""
    from app.rag.parser import DocumentParser

    # 1. Text file
    txt_file = tmp_path / "sample.txt"
    txt_file.write_text("This is a sample document for testing parser.", encoding="utf-8")
    pages_txt = DocumentParser.parse_file(str(txt_file), "sample.txt")
    assert len(pages_txt) == 1
    assert "sample document" in pages_txt[0][1]

    # 2. Markdown file
    md_file = tmp_path / "notes.md"
    md_file.write_text("# LifeForge Notes\n- Task 1\n- Task 2", encoding="utf-8")
    pages_md = DocumentParser.parse_file(str(md_file), "notes.md")
    assert len(pages_md) == 1
    assert "LifeForge Notes" in pages_md[0][1]


@pytest.mark.asyncio
async def test_weaviate_memory_lifecycle():
    """Verify Weaviate semantic memory insertion, search with threshold, and deletion."""
    # 1. Insert memory
    mem = await weaviate_service.insert_memory(
        user_id="user_carol",
        content="Prefers mock interview questions focused on distributed systems and Kafka.",
        memory_type="preference",
        importance=0.9
    )
    assert mem.id is not None
    assert mem.user_id == "user_carol"

    # 2. Search memory
    results = await weaviate_service.search_memories(
        user_id="user_carol",
        query="distributed systems Kafka questions"
    )
    assert len(results) > 0
    assert results[0].user_id == "user_carol"

    # 3. User isolation check (User Dave cannot retrieve Carol's memory)
    dave_results = await weaviate_service.search_memories(
        user_id="user_dave",
        query="distributed systems Kafka questions"
    )
    assert len(dave_results) == 0

    # 4. Delete memory
    deleted = await weaviate_service.delete_memory(user_id="user_carol", memory_id=mem.id)
    assert deleted is True

    # 5. Verify deleted
    after_delete = await weaviate_service.search_memories(
        user_id="user_carol",
        query="distributed systems Kafka"
    )
    assert not any(m.id == mem.id for m in after_delete)

