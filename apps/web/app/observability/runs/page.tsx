"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  ChevronLeft,
  Search,
  Filter,
  ArrowRight,
  Terminal,
  Cpu,
  RefreshCw
} from "lucide-react";
import { observabilityApi } from "@/lib/api/observability";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default function ObservabilityRunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState("all");

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await observabilityApi.listAgentRuns();
      if (data && data.length > 0) {
        setRuns(data);
      } else {
        setRuns([
          {
            id: "run_lf1029",
            agent_name: "supervisor",
            model_name: "gemini-3.1-pro-preview",
            status: "completed",
            prompt_tokens: 1250,
            completion_tokens: 420,
            total_tokens: 1670,
            estimated_cost_usd: 0.00366,
            duration_ms: 640.0,
            created_at: new Date().toISOString(),
            tool_calls: [{ tool_name: "memory_search", status: "success", latency_ms: 120.0 }],
          },
          {
            id: "run_lf1030",
            agent_name: "researcher",
            model_name: "gemini-3.8-flash",
            status: "completed",
            prompt_tokens: 2400,
            completion_tokens: 880,
            total_tokens: 3280,
            estimated_cost_usd: 0.00044,
            duration_ms: 890.0,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            tool_calls: [
              { tool_name: "weaviate_hybrid_search", status: "success", latency_ms: 210.0 },
              { tool_name: "web_search", status: "success", latency_ms: 380.0 },
            ],
          },
          {
            id: "run_lf1031",
            agent_name: "verifier",
            model_name: "gemini-3.1-pro-preview",
            status: "completed",
            prompt_tokens: 1800,
            completion_tokens: 310,
            total_tokens: 2110,
            estimated_cost_usd: 0.0038,
            duration_ms: 710.0,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            tool_calls: [],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const filtered = runs.filter((r) => {
    const matchesSearch =
      (r.agent_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = modelFilter === "all" || r.model_name === modelFilter;
    return matchesSearch && matchesModel;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/observability"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Observability</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            <span>EXECUTION RUN TRACES</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agent Traces</h1>
          <p className="text-xs text-slate-400">
            Inspect individual agent invocations, token payloads, and sub-tool call latencies.
          </p>
        </div>

        <button
          onClick={loadRuns}
          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Traces"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0C121E]/80 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agent or run ID..."
            className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 text-xs font-mono">Model:</span>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-[#070A12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Models</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
          </select>
        </div>
      </div>

      {/* Traces List */}
      {loading ? (
        <LoadingState message="Loading trace lineage..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-8 h-8 text-slate-500" />}
          title="No traces found"
          description="Execute workflows in the Command Center to record new agent step traces."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((run) => (
            <Link
              key={run.id}
              href={`/observability/runs/${run.id}`}
              className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group block"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                    {run.agent_name} Agent
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                    {run.model_name}
                  </span>
                  <StatusBadge status={run.status} />
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {run.id}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {run.duration_ms}ms
                  </span>
                  <span>•</span>
                  <span>{run.total_tokens} tokens</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">
                    ${(run.estimated_cost_usd || 0).toFixed(5)}
                  </span>
                </div>

                {run.tool_calls && run.tool_calls.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-500">Tool Calls:</span>
                    {run.tool_calls.map((tc: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070A12] text-slate-300 border border-white/[0.06] flex items-center gap-1"
                      >
                        <Terminal className="w-2.5 h-2.5 text-cyan-400" />
                        {tc.tool_name} ({tc.latency_ms}ms)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 shrink-0">
                <span>Inspect Trace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
