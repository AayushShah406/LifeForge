import os
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("lifeforge.database")

Base = declarative_base()

db_url = settings.DATABASE_URL or "sqlite+aiosqlite:///./lifeforge.db"
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True if "postgresql" in db_url else False,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for obtaining an asynchronous database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables with resilient SQLite fallback if Postgres is unavailable."""
    global engine, async_session_factory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database tables initialized successfully on engine: {engine.url.drivername}")
    except Exception as e:
        logger.warning(f"Primary database connection failed: {e}. Switching to resilient local SQLite (lifeforge.db)...")
        fallback_url = "sqlite+aiosqlite:///./lifeforge.db"
        engine = create_async_engine(
            fallback_url,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False}
        )
        async_session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Resilient SQLite database tables initialized successfully.")

