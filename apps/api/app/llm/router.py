"""Centralized Model Router for Gemini 3 Family (Sections 15, 16, 47, 80-85)."""
import logging
from typing import Optional
from app.core.config import settings
from app.llm.base import BaseLLMProvider
from app.llm.gemini import GeminiProvider

logger = logging.getLogger("lifeforge.llm.router")

_reasoning_instance: Optional[GeminiProvider] = None
_fast_instance: Optional[GeminiProvider] = None
_lightweight_instance: Optional[GeminiProvider] = None
_embedding_instance: Optional[GeminiProvider] = None


class ModelRouter:
    """Centralized dynamic model router for LifeForge agent workflows."""

    @staticmethod
    def select(task: str, complexity: str = "normal") -> GeminiProvider:
        """Route to appropriate Gemini 3 model role based on task and complexity."""
        task_lower = task.lower()
        complexity_lower = complexity.lower()

        # 1. High-complexity reasoning, verification, or supervisor orchestration
        if (
            complexity_lower == "high"
            or "supervisor" in task_lower
            or "verification" in task_lower
            or "evaluat" in task_lower
            or "recovery" in task_lower
            or "architecture" in task_lower
        ):
            return get_reasoning_model()

        # 2. Lightweight classification, metadata, memory extraction, intent detection
        if (
            complexity_lower == "low"
            or "extract" in task_lower
            or "classif" in task_lower
            or "metadata" in task_lower
            or "intent" in task_lower
            or "candidate" in task_lower
        ):
            return get_lightweight_model()

        # 3. Default fast execution (routine agent reasoning, research, document RAG, tools)
        return get_fast_model()


def get_reasoning_model() -> GeminiProvider:
    """Role 1: Strongest Gemini 3 reasoning-capable model (Section 81)."""
    global _reasoning_instance
    if _reasoning_instance is None:
        _reasoning_instance = GeminiProvider(model_name=settings.GEMINI_REASONING_MODEL)
    return _reasoning_instance


def get_fast_model() -> GeminiProvider:
    """Role 2: High-throughput fast Gemini 3 model (Section 82)."""
    global _fast_instance
    if _fast_instance is None:
        _fast_instance = GeminiProvider(model_name=settings.GEMINI_FAST_MODEL)
    return _fast_instance


def get_lightweight_model() -> GeminiProvider:
    """Role 3: Low-latency lightweight Gemini 3 model (Section 83)."""
    global _lightweight_instance
    if _lightweight_instance is None:
        _lightweight_instance = GeminiProvider(model_name=settings.effective_light_model)
    return _lightweight_instance


def get_embedding_model() -> GeminiProvider:
    """Role 4: Gemini vector embedding model (Section 84)."""
    global _embedding_instance
    if _embedding_instance is None:
        _embedding_instance = GeminiProvider(model_name=settings.GEMINI_EMBEDDING_MODEL)
    return _embedding_instance


# Router singleton
router = ModelRouter()
