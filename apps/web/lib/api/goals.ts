import { apiFetch } from "./client";
import { Workflow } from "./workflows";

export interface Goal {
  id: string;
  user_id: string;
  raw_prompt: string;
  title: string;
  status: string;
  category: string;
  intent_data?: any;
  created_at: string;
}

export async function createGoal(prompt: string, category = "general"): Promise<Goal> {
  return apiFetch<Goal>("/api/goals", {
    method: "POST",
    body: JSON.stringify({ raw_prompt: prompt, category }),
  });
}

export async function listGoals(): Promise<Goal[]> {
  try {
    return await apiFetch<Goal[]>("/api/goals");
  } catch {
    return [];
  }
}

/**
 * Execute a goal: creates a goal then immediately spawns a LangGraph workflow.
 * Returns the Workflow object which contains the plan, steps, and live status.
 */
export async function executeGoal(prompt: string, model = "gemini-3.1-pro-preview"): Promise<Workflow> {
  // Step 1: Create the goal record (intent analysis happens here)
  const goal = await apiFetch<Goal>("/api/goals", {
    method: "POST",
    body: JSON.stringify({ raw_prompt: prompt, category: "general" }),
  });

  // Step 2: Spawn a LangGraph workflow against the goal
  const workflow = await apiFetch<Workflow>("/api/workflows", {
    method: "POST",
    body: JSON.stringify({
      goal_prompt: prompt,
      goal_id: goal.id,
      title: goal.title || prompt.slice(0, 60),
      model,
    }),
  });

  return workflow;
}

export const goalsApi = {
  createGoal,
  listGoals,
  executeGoal,
};
