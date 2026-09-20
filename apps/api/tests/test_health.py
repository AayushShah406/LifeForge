import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Test the root platform discovery endpoint."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "LifeForge"
    assert "tagline" in data
    assert data["docs"] == "/docs"


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    """Test the top-level health check endpoint."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["platform"] == "LifeForge"
    assert "models" in data
    assert "reasoning" in data["models"]
    assert "fast" in data["models"]
    assert "lite" in data["models"]
    assert "embedding" in data["models"]


@pytest.mark.asyncio
async def test_api_health_endpoint(async_client: AsyncClient):
    """Test the /api/health endpoint with detailed subsystem statuses."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "subsystems" in data
    assert "database" in data["subsystems"]
    assert "weaviate_cloud" in data["subsystems"]
    assert "redis_worker" in data["subsystems"]
