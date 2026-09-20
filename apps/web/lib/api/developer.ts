import { apiFetch } from "./client";

export interface SystemHealth {
  status: string;
  timestamp: string;
  subsystems: {
    fastapi: any;
    postgresql: any;
    redis: any;
    weaviate_cloud: any;
    gemini_3: any;
    langsmith: any;
    mcp_server: any;
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  return apiFetch<SystemHealth>("/api/developer/health");
}

export async function getAgentRegistry(): Promise<any[]> {
  return apiFetch<any[]>("/api/developer/agents");
}

export async function getAgents(): Promise<any[]> {
  return getAgentRegistry();
}

export async function getToolRegistry(): Promise<any[]> {
  return apiFetch<any[]>("/api/developer/tools");
}

export async function getTools(): Promise<any[]> {
  return getToolRegistry();
}

export async function getModelConfig(): Promise<any> {
  return apiFetch<any>("/api/developer/models");
}

export async function getModels(): Promise<any[]> {
  const data = await getModelConfig();
  return Array.isArray(data) ? data : data.models || [];
}

export const developerApi = {
  getSystemHealth,
  getAgentRegistry,
  getAgents,
  getToolRegistry,
  getTools,
  getModelConfig,
  getModels,
};
