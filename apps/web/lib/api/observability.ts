import { apiFetch } from "./client";

export interface UsageMetrics {
  summary: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    estimated_cost_usd: number;
    total_runs: number;
    average_latency_ms: number;
  };
  tokens_over_time: Array<{ date: string; tokens: number; cost: number }>;
  model_distribution: Array<{ model: string; role: string; percentage: number; tokens: number }>;
  agent_cost_breakdown: Array<{ agent: string; cost: number; runs: number }>;
}

export interface TraceNode {
  id: string;
  name: string;
  agent?: string;
  model?: string;
  duration_ms: number;
  status?: string;
  input?: any;
  output?: any;
  children?: any[];
}

export interface HierarchicalTrace {
  run_id: string;
  workflow_id: string;
  goal: string;
  langsmith_project?: string;
  langsmith_url?: string;
  status: string;
  total_latency_ms: number;
  total_tokens: number;
  nodes?: TraceNode[];
  tree?: any;
}

export async function getUsageMetrics(): Promise<UsageMetrics> {
  return apiFetch<UsageMetrics>("/api/observability/usage");
}

export async function getHierarchicalTrace(runId: string): Promise<HierarchicalTrace> {
  return apiFetch<HierarchicalTrace>(`/api/observability/runs/${runId}/trace`);
}

export async function getRunTrace(runId: string): Promise<HierarchicalTrace> {
  return getHierarchicalTrace(runId);
}

export async function listAgentRuns(): Promise<any[]> {
  try {
    return await apiFetch<any[]>("/api/agent-runs");
  } catch {
    return [];
  }
}

export const observabilityApi = {
  getUsageMetrics,
  getHierarchicalTrace,
  getRunTrace,
  listAgentRuns,
};
