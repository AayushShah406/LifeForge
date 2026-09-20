import { apiFetch, API_BASE } from "./client";

export interface DocumentItem {
  id: string;
  filename: string;
  document_type: string;
  file_size_bytes?: number;
  total_pages?: number;
  chunk_count?: number;
  total_chunks?: number;
  indexing_status?: string; // pending, parsing, chunking, embedding, indexed, failed
  status?: string;
  chunks?: any[];
  created_at?: string;
}

export async function listDocuments(): Promise<DocumentItem[]> {
  try {
    return await apiFetch<DocumentItem[]>("/api/documents");
  } catch {
    return [];
  }
}

export async function uploadDocument(file: File, documentType = "resume"): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
}

export async function searchDocuments(query: string, top_k = 4): Promise<any[]> {
  return apiFetch("/api/documents/search", {
    method: "POST",
    body: JSON.stringify({ query, top_k }),
  });
}

export const documentsApi = {
  listDocuments,
  uploadDocument,
  deleteDocument,
  searchDocuments,
};
