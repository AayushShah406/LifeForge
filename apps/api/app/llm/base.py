"""Base LLM Provider and Schema Specifications (Sections 15-16)."""
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
