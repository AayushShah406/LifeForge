import { apiFetch } from "./client";

export interface McpTool {
  name: string;
  server: string;
  description: string;
  permission?: string;
  input_schema?: any;
  calls_total?: number;
  success_rate?: string;
  recent_calls?: any[];
}

export interface McpServer {
  id: string;
  name: string;
  protocol: string;
  endpoint: string;
  status: string;
  tools_count: number;
  tools: string[];
}

export async function listMcpTools(): Promise<{ servers: McpServer[]; tools_summary: any[] }> {
  try {
    return await apiFetch<{ servers: McpServer[]; tools_summary: any[] }>("/api/tools/mcp");
  } catch {
    return { servers: [], tools_summary: [] };
  }
}

export async function getToolDetail(toolName: string): Promise<McpTool> {
  return apiFetch<McpTool>(`/api/tools/mcp/${toolName}`);
}

export async function invokeMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
  return apiFetch(`/api/tools/mcp/${toolName}`, {
    method: "POST",
    body: JSON.stringify(args),
  });
}

export async function listIntegrations(): Promise<any[]> {
  try {
    return await apiFetch<any[]>("/api/integrations");
  } catch {
    return [];
  }
}

export const toolsApi = {
  listMcpTools,
  getToolDetail,
  invokeMcpTool,
  listIntegrations,
};
