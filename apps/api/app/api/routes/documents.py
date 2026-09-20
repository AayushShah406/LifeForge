from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.database import User
from app.api.deps import get_current_user
from app.schemas.document import DocumentResponse, DocumentSearchRequest
from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    category: Optional[str] = Form("general"),
    user: User = Depends(get_current_user)
):
    """Upload and parse a document (PDF, DOCX, TXT, MD) into Weaviate Cloud v4 chunks."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    doc = await document_service.process_uploaded_file(
        user_id=user.id,
        filename=file.filename or "unknown_file",
        file_bytes=content,
        category=category
    )
    return doc


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """List all documents uploaded by user."""
    return await document_service.list_documents(user_id=user.id, limit=limit)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: User = Depends(get_current_user)
):
    """Retrieve document metadata and ingestion status."""
    doc = await document_service.get_document(document_id=document_id, user_id=user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a document and its stored vectors."""
    deleted = await document_service.delete_document(document_id=document_id, user_id=user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")


@router.post("/search")
async def search_documents(
    payload: DocumentSearchRequest,
    user: User = Depends(get_current_user)
):
    """Perform dense vector semantic search against user's documents."""
    results = await document_service.search(
        user_id=user.id,
        query=payload.query,
        top_k=payload.top_k
    )
    return {"query": payload.query, "results": results, "count": len(results)}
