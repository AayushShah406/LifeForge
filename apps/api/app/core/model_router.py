"""Backward-compatible facade for model routing.
Direct callers are encouraged to use app.models: reasoning_model(), fast_model(), etc.
"""

from app.models.provider import (
    BaseLLMProvider,
    ModelResponse,
    ModelUsage,
    reasoning_model,
    fast_model,
    lightweight_model,
    embedding_model,
)
from app.models.gemini import MODEL_PRICING


class ModelRouterFacade:
    @staticmethod
    def reasoning() -> BaseLLMProvider:
        return reasoning_model()

    @staticmethod
    def fast() -> BaseLLMProvider:
        return fast_model()

    @staticmethod
    def lightweight() -> BaseLLMProvider:
        return lightweight_model()

    @staticmethod
    def embedding() -> BaseLLMProvider:
        return embedding_model()


model_router = ModelRouterFacade()

__all__ = [
    "BaseLLMProvider",
    "ModelResponse",
    "ModelUsage",
    "model_router",
    "reasoning_model",
    "fast_model",
    "lightweight_model",
    "embedding_model",
    "MODEL_PRICING",
]
