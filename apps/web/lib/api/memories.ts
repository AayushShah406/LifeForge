import { apiFetch } from "./client";

export interface MemoryItem {
  id: string;
  user_id?: string;
  content: string;
  memory_type: string; // preference, fact, recurring_goal, decision
  importance: number;
  confidence?: number;
  source?: string;
  created_at?: string;
}

export async function listMemories(): Promise<MemoryItem[]> {
  try {
    return await apiFetch<MemoryItem[]>("/api/memories");
  } catch {
    return [];
  }
}

export async function createMemory(data: { content: string; memory_type?: string; importance?: number }): Promise<MemoryItem> {
  return apiFetch<MemoryItem>("/api/memories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteMemory(id: string): Promise<void> {
  await apiFetch(`/api/memories/${id}`, { method: "DELETE" });
}

export const memoriesApi = {
  listMemories,
  createMemory,
  deleteMemory,
};
