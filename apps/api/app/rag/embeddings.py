import logging
from typing import List
from app.models import embedding_model

logger = logging.getLogger("lifeforge.embeddings")


class EmbeddingService:
    """Generates dense vector embeddings using the configured Gemini embedding model."""

    def __init__(self):
        self._provider = embedding_model()

    async def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single text chunk."""
        if not text or not text.strip():
            return [0.0] * 768
        return await self._provider.get_embedding(text)

    async def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for multiple text chunks."""
        vectors = []
        for t in texts:
            vec = await self.get_embedding(t)
            vectors.append(vec)
        return vectors


embedding_service = EmbeddingService()


async def generate_query_embedding(text: str) -> List[float]:
    """Generates query vector embedding."""
    return await embedding_service.get_embedding(text)


__all__ = ["EmbeddingService", "embedding_service", "generate_query_embedding"]
