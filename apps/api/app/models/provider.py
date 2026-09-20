from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class ModelUsage(BaseModel):
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0
    latency_ms: float = 0.0


class ModelResponse(BaseModel):
    content: str
    structured: Optional[Any] = None
    usage: ModelUsage


class BaseLLMProvider(ABC):
    """Abstract base provider for LLMs and Embedding models."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        response_schema: Optional[Type[T]] = None,
    ) -> ModelResponse:
        """Generates text or structured schema from LLM."""
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """Generates embedding vector representation for input text."""
        pass


# Global channel getters
def reasoning_model() -> BaseLLMProvider:
    """Returns the primary reasoning & orchestration model (gemini-3.1-pro-preview)."""
    from app.models.gemini import get_reasoning_model
    return get_reasoning_model()


def fast_model() -> BaseLLMProvider:
    """Returns the high-throughput fast execution model (gemini-3.8-flash)."""
    from app.models.gemini import get_fast_model
    return get_fast_model()


def lightweight_model() -> BaseLLMProvider:
    """Returns the low-latency lightweight extraction model (gemini-3.1-flash-lite)."""
    from app.models.gemini import get_lightweight_model
    return get_lightweight_model()


def embedding_model() -> BaseLLMProvider:
    """Returns the embedding model (gemini-embedding-001)."""
    from app.models.gemini import get_embedding_model
    return get_embedding_model()
