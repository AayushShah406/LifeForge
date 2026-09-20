import uuid
from typing import List, Dict, Any


class DocumentChunker:
    """Sliding-window semantic text chunker preserving page and positional metadata."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_document(
        self,
        document_id: str,
        user_id: str,
        filename: str,
        document_type: str,
        pages: List[tuple[int, str]]
    ) -> List[Dict[str, Any]]:
        chunks = []

        for item in pages:
            if isinstance(item, (tuple, list)):
                page_num, text = item[0], item[1]
            elif isinstance(item, dict):
                page_num, text = item.get("page_number", 1), item.get("content", "")
            else:
                continue

            if not text.strip():
                continue

            words = text.split()
            if len(words) <= self.chunk_size:
                chunks.append({
                    "chunk_id": f"{document_id}_{page_num}_0",
                    "document_id": document_id,
                    "user_id": user_id,
                    "content": text,
                    "document_type": document_type,
                    "source": filename,
                    "page_number": page_num,
                })
                continue

            start = 0
            chunk_idx = 0
            while start < len(words):
                end = min(start + self.chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_text = " ".join(chunk_words)

                chunks.append({
                    "chunk_id": f"{document_id}_{page_num}_{chunk_idx}",
                    "document_id": document_id,
                    "user_id": user_id,
                    "content": chunk_text,
                    "document_type": document_type,
                    "source": filename,
                    "page_number": page_num,
                })

                chunk_idx += 1
                if end == len(words):
                    break
                start += (self.chunk_size - self.chunk_overlap)

        return chunks
