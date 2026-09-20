"""Unified Semantic Search API (Sections 35, 39, 99-100).

Performs user-isolated hybrid semantic search across:
- Uploaded Document Chunks
- Semantic Memories
- Verified Knowledge Items
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.database import User
from app.api.deps import get_current_user
from app.vectorstore.service import vector_store_service
from app.llm.router import get_fast_model

router = APIRouter(prefix="/search", tags=["Search"])


class SemanticSearchRequest(BaseModel):
    query: str = Field(description="Natural language query to embed and search")
    limit: int = Field(default=10, ge=1, le=50)
    document_type: Optional[str] = None
    target: str = Field(default="all", description="'documents', 'memories', 'knowledge', or 'all'")


@router.post("/semantic")
async def semantic_search(
    payload: SemanticSearchRequest,
    user: User = Depends(get_current_user)
):
    """Execute semantic retrieval pipeline with mandatory user_id tenant filtering."""
    results: Dict[str, Any] = {
        "query": payload.query,
        "user_id": user.id,
        "document_chunks": [],
        "memories": [],
        "knowledge_items": [],
        "synthesized_answer": None
    }

    # 1. Search Document Chunks
    if payload.target in ("all", "documents"):
        docs = await vector_store_service.search_documents(
            user_id=user.id,
            query=payload.query,
            limit=payload.limit,
            document_type=payload.document_type
        )
        results["document_chunks"] = docs

    # 2. Search Semantic Memory
    if payload.target in ("all", "memories"):
        mems = await vector_store_service.search_memories(
            user_id=user.id,
            query=payload.query,
            limit=min(payload.limit, 5)
        )
        results["memories"] = mems

    # 3. Search Knowledge Items
    if payload.target in ("all", "knowledge"):
        know = await vector_store_service.search_knowledge(
            user_id=user.id,
            query=payload.query,
            limit=payload.limit
        )
        results["knowledge_items"] = know

    # 4. Optional grounded synthesis via Gemini Fast Model
    retrieved_texts = [d.get("content", "") for d in results["document_chunks"]] + [m.get("content", "") for m in results["memories"]]
    if retrieved_texts:
        context_block = "\n---\n".join(retrieved_texts[:5])
        prompt = f"""Synthesize a direct, grounded answer for the user based strictly on the retrieved context below.
If the context does not contain the answer, state that clearly. Do not fabricate information.

User Query: {payload.query}

Retrieved Context:
{context_block}
"""
        fast_llm = get_fast_model()
        resp = await fast_llm.generate(
            prompt=prompt,
            system_instruction="You are LifeForge's grounded semantic retrieval assistant."
        )
        results["synthesized_answer"] = resp.content

    return results
