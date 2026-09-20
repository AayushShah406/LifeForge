import { apiFetch } from "./client";

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  status: string;
  tools: string[];
  success_rate: number;
  average_latency_ms: number;
  total_runs: number;
}

export async function listAgents(): Promise<AgentInfo[]> {
  try {
    return await apiFetch<AgentInfo[]>("/api/developer/agents");
  } catch {
    return [];
  }
}

export const agentsApi = {
  listAgents,
};
