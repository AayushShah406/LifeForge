import pytest
from app.memory.extraction import memory_extractor
from app.memory.retrieval import memory_retriever
from app.memory.storage import memory_storage


@pytest.mark.asyncio
async def test_memory_extraction_candidates():
    """Verify MemoryExtractor extracts structured memory candidates from conversations."""
    content = (
        "I strongly prefer practicing mock interviews in Python rather than C++. "
        "Also, my target interview date is definitely next Thursday at 2 PM. "
        "The weather is nice today."
    )
    candidates = await memory_extractor.extract_candidates(
        content=content,
        user_id="user_test_001",
        workflow_id="wf_test_001"
    )

    assert isinstance(candidates, list)
    # The weather sentence should not be considered an important personal memory
    for c in candidates:
        assert c.importance >= 0.70
        assert c.memory_type in ["preference", "recurring_goal", "fact", "constraint"]


@pytest.mark.asyncio
async def test_memory_formatting_context():
    """Verify memory retriever produces clean formatted context for agent prompts."""
    context = await memory_retriever.get_formatted_memory_context(
        user_id="user_test_001",
        query="preferred programming language for mock interviews"
    )
    assert isinstance(context, str)
