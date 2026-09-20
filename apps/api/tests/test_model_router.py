import pytest
from app.core.model_router import model_router, MODEL_PRICING
from app.schemas.agent_state import IntentAnalysis


@pytest.mark.asyncio
async def test_model_router_channels():
    """Verify reasoning, fast, lightweight, and embedding channels instantiate properly."""
    reasoning_llm = model_router.reasoning()
    fast_llm = model_router.fast()
    lite_llm = model_router.lightweight()
    embed_llm = model_router.embedding()

    assert reasoning_llm.model_name == "gemini-3.1-pro-preview"
    assert fast_llm.model_name == "gemini-3.8-flash"
    assert lite_llm.model_name == "gemini-3.1-flash-lite"
    assert embed_llm.model_name == "gemini-embedding-001"


@pytest.mark.asyncio
async def test_model_pricing_table():
    """Verify Gemini 3 models have defined pricing for cost calculation."""
    for model in ["gemini-3.1-pro-preview", "gemini-3.8-flash", "gemini-3.1-flash-lite"]:
        assert model in MODEL_PRICING
        assert "input" in MODEL_PRICING[model]
        assert "output" in MODEL_PRICING[model]


@pytest.mark.asyncio
async def test_structured_generation_fallback():
    """Verify structured generation handles Pydantic schema validation."""
    reasoning_llm = model_router.reasoning()
    res = await reasoning_llm.generate(
        prompt="User wants to prepare for an interview next Thursday at Google",
        response_schema=IntentAnalysis
    )
    assert res is not None
    assert res.usage.total_tokens > 0
    assert res.usage.estimated_cost_usd >= 0.0
