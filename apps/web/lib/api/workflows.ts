import { apiFetch } from "./client";

export interface PlanStep {
  id: string;
  agent: string;
  title?: string;
  description: string;
  dependencies: string[];
  requires_approval: boolean;
  status: string;
  tool_hints?: string[];
  estimated_minutes?: number;
}

export interface Workflow {
  id: string;
  user_id: string;
  goal_id?: string;
  title: string;
  status: string;
  plan: {
    goal?: string;
    workflow_type?: string;
    steps?: PlanStep[];
    estimated_duration_minutes?: number;
  };
  current_step_id?: string;
  final_result?: any;
  total_tokens: number;
  estimated_cost_usd: number;
  created_at: string;
  steps: any[];
  pending_approvals: any[];
}

export async function createWorkflow(goalPrompt: string, title?: string): Promise<Workflow> {
  return apiFetch<Workflow>("/api/workflows", {
    method: "POST",
    body: JSON.stringify({ goal_prompt: goalPrompt, title }),
  });
}

export async function getWorkflow(id: string): Promise<Workflow> {
  return apiFetch<Workflow>(`/api/workflows/${id}`);
}

export async function listWorkflows(): Promise<Workflow[]> {
  try {
    return await apiFetch<Workflow[]>("/api/workflows");
  } catch {
    return [];
  }
}

export async function approveWorkflowAction(workflowId: string, approvalId: string, comment?: string) {
  return apiFetch(`/api/workflows/${workflowId}/approve`, {
    method: "POST",
    body: JSON.stringify({ approval_id: approvalId, decision: "approved", comment }),
  });
}

export async function rejectWorkflowAction(workflowId: string, approvalId: string, comment?: string) {
  return apiFetch(`/api/workflows/${workflowId}/reject`, {
    method: "POST",
    body: JSON.stringify({ approval_id: approvalId, decision: "rejected", comment }),
  });
}

export const workflowsApi = {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  approveWorkflowAction,
  rejectWorkflowAction,
};
