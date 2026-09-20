"""Gemini Vector Embedding Generator (Section 84)."""
from typing import List
from app.llm.router import get_embedding_model


async def generate_embedding(text: str) -> List[float]:
    """Generates a dense vector representation using the configured Gemini embedding model."""
    embedder = get_embedding_model()
    return await embedder.get_embedding(text)
