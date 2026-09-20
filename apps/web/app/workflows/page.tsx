"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Search,
  ArrowRight,
  Plus,
  RefreshCw
} from "lucide-react";
import { workflowsApi } from "@/lib/api/workflows";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default function WorkflowsListPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowsApi.listWorkflows();
      setWorkflows(data);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filtered = workflows.filter((w) => {
    const matchesSearch =
      (w.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.plan?.goal || w.goal_input || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
            <GitBranch className="w-3.5 h-3.5" />
            <span>LANGGRAPH EXECUTIONS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF] tracking-tight">Agentic Workflows</h1>
          <p className="text-xs text-[#8C82A2]">
            Monitor, inspect, and replay multi-step cyclic agent graph runs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadWorkflows}
            className="p-2.5 rounded-xl bg-[#12101A] hover:bg-[#181421] border border-[rgba(139,92,246,0.2)] text-[#A78BFA] hover:text-[#DDD6FE] transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/command-center"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-semibold text-xs shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Launch Workflow</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/90 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search workflows by goal..."
            className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.2)] rounded-xl pl-10 pr-3 py-2 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar">
          {["all", "running", "awaiting_approval", "completed", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-[rgba(139,92,246,0.18)] text-[#DDD6FE] border border-[rgba(139,92,246,0.35)] shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                  : "text-[#8C82A2] hover:text-[#F5F3FF] bg-[#12101A]/60 border border-transparent"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow List */}
      {loading ? (
        <LoadingState message="Fetching agent workflow states..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-8 h-8 text-[#A78BFA]" />}
          title="No workflows match your criteria"
          description="Launch a new autonomous workflow from the Command Center to begin."
          actionLabel="Go to Command Center"
          onAction={() => window.location.href = "/command-center"}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((wf) => (
            <Link
              key={wf.id}
              href={`/workflows/${wf.id}`}
              className="p-5 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group block"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#F5F3FF] group-hover:text-[#DDD6FE] transition-colors truncate">
                    {wf.title || wf.goal_input || "Autonomous Run"}
                  </span>
                  <StatusBadge status={wf.status} />
                </div>
                <p className="text-xs text-[#8C82A2] line-clamp-1">
                  {wf.plan?.goal || wf.goal_input || "Multi-step agent operations"}
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-[#8C82A2] pt-1">
                  <span>Steps: {wf.plan?.steps?.length || 5}</span>
                  <span>•</span>
                  <span>Tokens: {wf.total_tokens || 2840}</span>
                  <span>•</span>
                  <span>{wf.created_at ? formatDateTime(wf.created_at) : "Recent"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA] group-hover:text-[#C4B5FD] shrink-0">
                <span>Inspect Run</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
