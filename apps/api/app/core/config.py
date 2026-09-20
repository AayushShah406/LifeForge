import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application settings
    APP_NAME: str = "LifeForge"
    APP_ENV: str = "development"
    PORT: int = 8001
    DEBUG: bool = True
    SECRET_KEY: str = "lifeforge-super-secret-production-key-change-in-prod-2026-xyz"
    JWT_SECRET: str = "lifeforge-jwt-secret-key-32bytes-long-super-safe"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database (PostgreSQL is the production application database)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/lifeforge"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/lifeforge"

    # Redis (background worker queue and state caching)
    REDIS_URL: str = "redis://localhost:6379/0"


    # Gemini 3-Family AI Models
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_REASONING_MODEL: str = "gemini-3.1-pro-preview"
    GEMINI_FAST_MODEL: str = "gemini-3.8-flash"
    GEMINI_LITE_MODEL: str = "gemini-3.1-flash-lite"
    GEMINI_LIGHT_MODEL: Optional[str] = None
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"

    @property
    def effective_light_model(self) -> str:
        return self.GEMINI_LIGHT_MODEL or self.GEMINI_LITE_MODEL

    # Weaviate Cloud Vector Database
    WEAVIATE_URL: Optional[str] = None
    WEAVIATE_API_KEY: Optional[str] = None
    WEAVIATE_ENVIRONMENT: str = "sandbox"

    # LangSmith Tracing & Observability
    LANGSMITH_API_KEY: Optional[str] = None
    LANGSMITH_PROJECT: str = "lifeforge-production"
    LANGSMITH_TRACING: bool = True
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"

    # Search provider
    SEARCH_API_KEY: Optional[str] = None

    # Google Workspace OAuth & Integrations
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8001/api/integrations/google/callback"
    ENABLE_GOOGLE_SIMULATION_SANDBOX: bool = True

    # Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: Optional[str] = None
    UPLOAD_DIR: str = "./uploads"

    # Agent Guardrails & Limits
    MAX_TOOL_CALLS_PER_RUN: int = 25
    AGENT_TIMEOUT_SECONDS: int = 180
    MAX_REVISION_LOOPS: int = 3
    AUTO_APPROVE_SAFE_ACTIONS: bool = False
    ENABLE_DEV_MOCK_FALLBACK: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ]


settings = Settings()
