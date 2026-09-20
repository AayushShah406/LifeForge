"""Test Weaviate Cloud 3 Collections & VectorStoreService (Section 86-102)."""
import pytest
from app.rag.weaviate_client import weaviate_client
from app.vectorstore.service import vector_store_service


def test_weaviate_collections_defined():
    """Verify Weaviate has exactly the 3 required canonical collections."""
    assert weaviate_client.COLLECTIONS == ["DocumentChunk", "SemanticMemory", "KnowledgeItem"]


@pytest.mark.asyncio
async def test_weaviate_health_check():
    """Verify health_check endpoint responds with expected 3 collections."""
    health = await weaviate_client.health_check()
    assert health["service"] == "weaviate"
    assert "collections" in health
    assert health["target_collections"] == ["DocumentChunk", "SemanticMemory", "KnowledgeItem"]


@pytest.mark.asyncio
async def test_vector_store_service_methods():
    """Verify VectorStoreService implements document, memory, and knowledge operations."""
    user_id = "test_user_weaviate_service"

    # 1. Insert & search memory
    mem = await vector_store_service.insert_memory(
        user_id=user_id,
        content="User prefers Python 3.12 and FastAPI for backend development.",
        memory_type="Preference",
        importance=0.9
    )
    assert mem["content"] == "User prefers Python 3.12 and FastAPI for backend development."

    # 2. Insert knowledge
    know = await vector_store_service.insert_knowledge(
        user_id=user_id,
        content="NextGen AI Labs requires LangGraph and Weaviate v4 expertise.",
        knowledge_type="research",
        title="NextGen Requirements"
    )
    assert know["title"] == "NextGen Requirements"
