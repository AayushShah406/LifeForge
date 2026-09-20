import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.database import init_db
from app.database.session import async_session_factory
from app.api import api_router, api_v1_router
from app.rag.weaviate_client import weaviate_client
from app.workers.redis_worker import redis_worker

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("lifeforge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Starting LifeForge Production Agentic Platform...")
    # Initialize database tables
    try:
        await init_db()
        logger.info("PostgreSQL database tables initialized.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or failed: {e}")

    # Connect to Weaviate Cloud v4
    connected = await weaviate_client.connect()
    if connected:
        logger.info("Connected to Weaviate Cloud v4 cluster.")
    else:
        logger.info("Weaviate Cloud offline or unconfigured; resilient fallback operational.")

    yield

    logger.info("Shutting down LifeForge Agentic Platform...")
    await weaviate_client.close()


app = FastAPI(
    title="LifeForge API",
    description="Turn goals into verified actions. Production-oriented Agentic AI Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers (Canonical v1 and compatibility /api)
app.include_router(api_v1_router)
app.include_router(api_router)


@app.get("/", tags=["Platform"])
async def root():
    """Root platform discovery endpoint."""
    return {
        "platform": settings.APP_NAME,
        "tagline": "Turn goals into verified actions",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api_prefix": "/api"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Root health check endpoint for monitoring."""
    db_status = "unhealthy"
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            db_status = "healthy"
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    redis_status = "connected" if await redis_worker.ping() else "offline"
    weaviate_status = "connected" if weaviate_client._is_connected else "offline"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "platform": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": db_status,
            "weaviate_cloud": weaviate_status,
            "redis_worker": redis_status,
        },
        "models": {
            "reasoning": settings.GEMINI_REASONING_MODEL,
            "fast": settings.GEMINI_FAST_MODEL,
            "lite": settings.GEMINI_LITE_MODEL,
            "embedding": settings.GEMINI_EMBEDDING_MODEL
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )
