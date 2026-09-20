import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    """Verify health check endpoint returns 200 and model metadata."""
    res = await async_client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "LifeForge"
    assert data["models"]["reasoning"] == "gemini-3.1-pro-preview"


@pytest.mark.asyncio
async def test_create_and_list_goals(async_client: AsyncClient):
    """Verify goal creation triggers intent analysis and list returns results."""
    payload = {
        "raw_prompt": "Prepare me for my interview next Thursday at Google.",
        "category": "interview"
    }
    res = await async_client.post("/api/goals", json=payload)
    assert res.status_code == 201
    goal = res.json()
    assert goal["id"] is not None
    assert "intent_data" in goal
    assert goal["status"] == "active"

    # List goals
    list_res = await async_client.get("/api/goals")
    assert list_res.status_code == 200
    goals = list_res.json()
    assert len(goals) >= 1


@pytest.mark.asyncio
async def test_create_workflow(async_client: AsyncClient):
    """Verify workflow initiation launches LangGraph execution."""
    payload = {
        "goal_prompt": "Conduct mock interview and create study plan for LangGraph.",
        "title": "Mock Interview Workflow"
    }
    res = await async_client.post("/api/workflows", json=payload)
    assert res.status_code in (201, 202)
    wf = res.json()
    assert wf["id"] is not None
    assert wf["title"] == "Mock Interview Workflow"
