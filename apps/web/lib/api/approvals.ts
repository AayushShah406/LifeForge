import { apiFetch } from "./client";

export interface ApprovalItem {
  id: string;
  workflow_id: string;
  action_type: string;
  tool_name: string;
  parameters: any;
  reason?: string;
  status: string; // pending, approved, rejected
  risk_level?: string;
  payload?: any;
  created_at: string;
}

export async function listApprovals(): Promise<ApprovalItem[]> {
  try {
    return await apiFetch<ApprovalItem[]>("/api/approvals");
  } catch {
    return [];
  }
}

export async function getPendingApprovals(): Promise<ApprovalItem[]> {
  try {
    const all = await listApprovals();
    return all.filter((a) => a.status === "pending" || a.status === "awaiting_approval");
  } catch {
    return [];
  }
}

export async function decideApproval(id: string, decision: "approved" | "rejected", comment?: string) {
  return apiFetch(`/api/approvals/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, comment }),
  });
}

export async function resolveApproval(id: string, status: "approved" | "rejected", comment?: string) {
  return decideApproval(id, status, comment);
}

export const approvalsApi = {
  listApprovals,
  getPendingApprovals,
  decideApproval,
  resolveApproval,
};
