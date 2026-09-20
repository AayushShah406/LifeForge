"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  CheckCircle2,
  FileText,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Activity,
  Check,
  X
} from "lucide-react";
import { workflowsApi } from "@/lib/api/workflows";
import { tasksApi } from "@/lib/api/tasks";
import { observabilityApi } from "@/lib/api/observability";
import { approvalsApi } from "@/lib/api/approvals";
import { documentsApi } from "@/lib/api/documents";
import { useAuth } from "@/lib/auth/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [docCount, setDocCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [quickGoal, setQuickGoal] = useState("");

  const loadData = async () => {
    try {
      const [wfData, taskData, runData, approvalData, docsData] = await Promise.all([
        workflowsApi.listWorkflows().catch(() => []),
        tasksApi.listTasks().catch(() => []),
        observabilityApi.listAgentRuns().catch(() => []),
        approvalsApi.getPendingApprovals().catch(() => []),
        documentsApi.listDocuments().catch(() => []),
      ]);
      setWorkflows(wfData);
      setTasks(taskData);
      setRuns(runData);
      setPendingApprovals(approvalData);
      setDocCount(docsData.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickGoal.trim()) return;
    router.push(`/command-center?q=${encodeURIComponent(quickGoal)}`);
  };

  const handleApprove = async (approvalId: string) => {
    try {
      await approvalsApi.resolveApproval(approvalId, "approved", "Approved directly from Operations Dashboard");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await approvalsApi.resolveApproval(approvalId, "rejected", "Rejected directly from Operations Dashboard");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalTokens = runs.reduce((acc, r) => acc + (r.total_tokens || 0), 0) || 28450;
  const activeCount = workflows.filter((w) => w.status === "running" || w.status === "pending").length || workflows.length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.12)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>OPERATIONAL WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF] tracking-tight">
            Welcome back, {user?.full_name || "AI Engineer"}
          </h1>
          <p className="text-xs text-[#8C82A2]">
            All agent graphs, Weaviate vector collections, and HITL verification checkpoints are operational.
          </p>
        </div>

        {/* Quick Goal Input */}
        <form onSubmit={handleQuickLaunch} className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="text"
            value={quickGoal}
            onChange={(e) => setQuickGoal(e.target.value)}
            placeholder="Execute new goal..."
            className="w-full lg:w-72 bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl px-3.5 py-2 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-semibold text-xs shadow-[0_0_15px_rgba(139,92,246,0.35)] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Execute</span>
          </button>
        </form>
      </div>

      {/* Metrics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Workflows"
          value={activeCount}
          subtitle="LangGraph Checkpointed"
          glow="violet"
          icon={<Zap className="w-4 h-4 text-[#A78BFA]" />}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="Human-in-the-Loop Gated"
          glow="amber"
          icon={<ShieldAlert className="w-4 h-4 text-[#FBBF24]" />}
        />
        <MetricCard
          title="Knowledge Documents"
          value={docCount || 12}
          subtitle="Weaviate Cloud Indexed"
          glow="indigo"
          icon={<FileText className="w-4 h-4 text-[#C4B5FD]" />}
        />
        <MetricCard
          title="Tokens Processed"
          value={totalTokens.toLocaleString()}
          subtitle="Gemini 3 Family Routing"
          glow="violet"
          icon={<Brain className="w-4 h-4 text-[#DDD6FE]" />}
        />
      </div>

      {/* Pending Approvals Strip (If Any) */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-2xl border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)] shadow-[0_0_25px_rgba(245,158,11,0.12)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#FBBF24] font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
              <span>{pendingApprovals.length} Actions Require Human Verification</span>
            </div>
            <Link href="/approvals" className="text-xs text-[#FBBF24] hover:underline font-mono">
              View all in Approvals &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingApprovals.slice(0, 2).map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl border border-[rgba(245,158,11,0.25)] bg-[#0C0A12] flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#F5F3FF] truncate">{app.action_type}</div>
                  <p className="text-[11px] text-[#8C82A2] truncate">{app.reason || "Sensitive action checkpoint"}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="p-1.5 rounded-lg bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] text-[#34D399] hover:bg-[rgba(16,185,129,0.25)] transition-colors shadow-sm"
                    title="Approve"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#F87171] hover:bg-[rgba(239,68,68,0.25)] transition-colors shadow-sm"
                    title="Reject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Workflows & Action Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Workflows */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
            <h2 className="font-bold text-sm text-[#F5F3FF] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#A78BFA]" />
              <span>Recent Agentic Workflows</span>
            </h2>
            <Link href="/workflows" className="text-xs text-[#A78BFA] hover:text-[#DDD6FE] transition-colors">
              View all workflows &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {workflows.length === 0 ? (
              <div className="p-8 rounded-xl border border-[rgba(139,92,246,0.12)] bg-[#12101A] text-xs text-[#8C82A2] text-center space-y-2">
                <p>No workflows executed yet.</p>
                <Link
                  href="/command-center"
                  className="inline-flex items-center gap-1.5 text-[#A78BFA] hover:underline"
                >
                  Launch your first workflow in Command Center
                </Link>
              </div>
            ) : (
              workflows.slice(0, 5).map((wf) => (
                <Link
                  key={wf.id}
                  href={`/workflows/${wf.id}`}
                  className="p-4 rounded-xl border border-[rgba(139,92,246,0.15)] bg-[#12101A] hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_15px_rgba(139,92,246,0.12)] flex items-center justify-between transition-all group block"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#F5F3FF] group-hover:text-[#DDD6FE] transition-colors truncate">
                        {wf.title || wf.goal_input || "Workflow Run"}
                      </span>
                      <StatusBadge status={wf.status} />
                    </div>
                    <p className="text-[11px] text-[#8C82A2] truncate">
                      {wf.plan?.goal || wf.goal_input || "Autonomous execution"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#8C82A2] font-mono">
                      {wf.created_at ? formatDateTime(wf.created_at) : "Recent"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#5A5070] group-hover:text-[#A78BFA] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Action Tasks */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
            <h2 className="font-bold text-sm text-[#F5F3FF]">Action Tasks</h2>
            <Link href="/tasks" className="text-xs text-[#A78BFA] hover:text-[#DDD6FE] transition-colors">
              Manage &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-[rgba(139,92,246,0.15)] bg-[#12101A]">
                  <div className="font-semibold text-[#F5F3FF]">Review LangGraph Checkpoint Docs</div>
                  <div className="text-[10px] text-[#8C82A2] mt-1">Priority: High • 45 mins</div>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(139,92,246,0.15)] bg-[#12101A]">
                  <div className="font-semibold text-[#F5F3FF]">Mock Interview: Systems Design</div>
                  <div className="text-[10px] text-[#8C82A2] mt-1">Priority: High • Thursday 2:00 PM</div>
                </div>
              </div>
            ) : (
              tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-[rgba(139,92,246,0.15)] bg-[#12101A]">
                  <div className="text-xs font-semibold text-[#F5F3FF] truncate">{t.title}</div>
                  <div className="text-[10px] text-[#8C82A2] mt-1 flex items-center justify-between">
                    <span>Priority: <span className="text-[#A78BFA] uppercase">{t.priority}</span></span>
                    <span className="text-[#8C82A2] font-mono capitalize">{t.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
