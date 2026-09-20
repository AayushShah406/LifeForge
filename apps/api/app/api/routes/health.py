from fastapi import APIRouter
from sqlalchemy import text
from app.core.config import settings
from app.database.session import async_session_factory
from app.rag.weaviate_client import weaviate_client
from app.workers.redis_worker import redis_worker
from app.mcp.registry import mcp_registry

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """Comprehensive system health check: Database, Weaviate, Redis, and Gemini 3 models (Section 57)."""
    db_status = "unhealthy"
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            db_status = "healthy"
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    redis_status = "connected" if await redis_worker.ping() else "offline"
    weav_health = await weaviate_client.health_check()
    weaviate_status = weav_health.get("status", "offline")

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "platform": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": db_status,
            "weaviate_cloud": weaviate_status,
            "redis_worker": redis_status,
            "mcp_tools": f"active ({len(mcp_registry.list_tools())} tools)",
        },
        "models": {
            "reasoning": settings.GEMINI_REASONING_MODEL,
            "fast": settings.GEMINI_FAST_MODEL,
            "lite": settings.effective_light_model,
            "embedding": settings.GEMINI_EMBEDDING_MODEL,
        }
    }


@router.get("/database")
async def health_database():
    """Test PostgreSQL database connection and query readiness."""
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            return {"service": "database", "status": "healthy", "type": "postgresql"}
    except Exception as e:
        return {"service": "database", "status": "degraded", "error": str(e)}


@router.get("/redis")
async def health_redis():
    """Test Redis broker connectivity."""
    is_connected = await redis_worker.ping()
    return {
        "service": "redis",
        "status": "healthy" if is_connected else "offline",
        "url": settings.REDIS_URL
    }


@router.get("/weaviate")
async def health_weaviate():
    """Test Weaviate Cloud cluster connectivity and collection status (Section 102)."""
    return await weaviate_client.health_check()


@router.get("/gemini")
async def health_gemini():
    """Validate Gemini 3 model configuration and readiness."""
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-here")
    return {
        "service": "gemini",
        "status": "healthy" if has_key else "simulated_fallback",
        "configured_roles": {
            "reasoning": settings.GEMINI_REASONING_MODEL,
            "fast": settings.GEMINI_FAST_MODEL,
            "lightweight": settings.effective_light_model,
            "embedding": settings.GEMINI_EMBEDDING_MODEL,
        }
    }


@router.get("/mcp")
async def health_mcp():
    """Check MCP server and tool registry status."""
    tools = mcp_registry.list_tools()
    return {
        "service": "mcp",
        "status": "healthy",
        "registered_tools_count": len(tools),
        "tools": [t.name for t in tools]
    }
