import { apiFetch } from "./client";

export interface TaskItem {
  id: string;
  user_id?: string;
  workflow_id?: string;
  title: string;
  description?: string;
  status: string; // pending, in_progress, completed, cancelled
  priority: string; // low, medium, high, urgent
  source?: string; // user, planner, workflow
  due_date?: string;
  estimated_duration_minutes?: number;
  created_at?: string;
}

export async function listTasks(): Promise<TaskItem[]> {
  try {
    return await apiFetch<TaskItem[]>("/api/tasks");
  } catch {
    return [];
  }
}

export async function createTask(data: Partial<TaskItem> | string, priority = "medium", description?: string): Promise<TaskItem> {
  const payload = typeof data === "string" ? { title: data, priority, description } : data;
  return apiFetch<TaskItem>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
  return apiFetch<TaskItem>(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
}

export const tasksApi = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};
