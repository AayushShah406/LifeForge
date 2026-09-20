"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Terminal,
  Play,
  CheckCircle2,
  Clock,
  RefreshCw,
  Database,
  Cpu,
  Activity,
} from "lucide-react";
import { goalsApi } from "@/lib/api/goals";
import { workflowsApi, Workflow, PlanStep } from "@/lib/api/workflows";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AgentGraphVisualizer } from "@/components/AgentGraphVisualizer";
import { API_BASE } from "@/lib/api/client";

const PRESET_GOALS = [
  "Audit staging cloud infrastructure for unattached volumes and draft remediation tasks.",
  "Synthesize recent AI engineering research on LangGraph multi-agent verification and summarize key architectural tradeoffs.",
  "Reconcile monthly team SaaS tool usage, identify inactive licenses, and prepare optimization steps.",
  "Create a 30-day learning plan for mastering Rust programming with daily milestones.",
  "Research and summarize the top 5 competitors in the project management SaaS space.",
  "Draft a comprehensive project proposal for a garbage management IoT system.",
];

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [goalInput, setGoalInput] = useState(initialQuery);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time SSE events
  const [liveEvents, setLiveEvents] = useState<Array<{ type: string; message: string; timestamp: string }>>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | undefined>(undefined);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-populate from URL query
  useEffect(() => {
    if (initialQuery && !workflow && !loading) {
      setGoalInput(initialQuery);
    }
  }, [initialQuery]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const connectSSE = (workflowId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
    const url = `${API_BASE}/api/workflows/${workflowId}/stream${token ? `?token=${token}` : ""}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const msg = {
          type: data.type || "event",
          message: data.message || data.type || JSON.stringify(data).slice(0, 80),
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setLiveEvents((prev) => [...prev.slice(-19), msg]);

        // Update live execution state
        if (data.type === "agent_started" && data.step_id) {
          setCurrentStepId(data.step_id);
        }
        if (data.type === "agent_completed" && data.step_id) {
          setCompletedSteps((prev) => [...prev, data.step_id]);
          setCurrentStepId(undefined);
        }
        if (data.type === "approval_required" && data.approvals) {
          setPendingApprovals(data.approvals);
        }
        if (data.type === "workflow_completed") {
          es.close();
          // Final poll to get full result
          workflowsApi.getWorkflow(workflowId).then(setWorkflow).catch(() => {});
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      // Fallback: poll for workflow updates every 3s
      pollingRef.current = setInterval(() => {
        workflowsApi.getWorkflow(workflowId).then((w) => {
          setWorkflow(w);
          if (w.status === "completed" || w.status === "failed") {
            clearInterval(pollingRef.current!);
          }
        }).catch(() => clearInterval(pollingRef.current!));
      }, 3000);
    };
  };

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goalInput.trim()) return;

    setError(null);
    setLoading(true);
    setWorkflow(null);
    setLiveEvents([]);
    setCompletedSteps([]);
    setCurrentStepId(undefined);
    setPendingApprovals([]);
    eventSourceRef.current?.close();
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      const result = await goalsApi.executeGoal(goalInput.trim(), selectedModel);
      setWorkflow(result);
      setLoading(false);
      // Connect SSE for real-time step updates
      if (result?.id) connectSSE(result.id);
    } catch (err: any) {
      setError(err.message || "Execution encountered an error. Please try again.");
      setLoading(false);
    }
  };

  // Derive plan steps from workflow for the visualizer
  const planSteps: PlanStep[] = workflow?.plan?.steps || [];

  // Telemetry from workflow
  const totalTokens = workflow?.total_tokens || 0;
  const estimatedCost = workflow?.estimated_cost_usd || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
          <Terminal className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>AUTONOMOUS WORKFLOW ORCHESTRATION</span>
        </div>
        <h1 className="text-3xl font-bold text-[#F5F3FF] tracking-tight">Command Center</h1>
        <p className="text-xs text-[#8C82A2]">
          Decompose any high-level objective into an autonomous, tool-executing, verified LangGraph workflow.
        </p>
      </div>

      {/* Goal Input Engine Card */}
      <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.15)] space-y-4">
        <form onSubmit={handleExecute} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#DDD6FE]">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                Goal Prompt
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8C82A2] font-mono">Routing Tier:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl px-2.5 py-1 text-[11px] text-[#DDD6FE] font-mono focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Speed)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Lightweight)</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., Create a 30-day learning plan for Rust, audit our AWS infrastructure, draft a project proposal for a smart city system..."
              className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl p-3.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] resize-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-4 text-[11px] text-[#8C82A2]">
              <span className="flex items-center gap-1 text-[#34D399]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dual-Verification Active
              </span>
              <span className="hidden sm:inline text-[#403854]">•</span>
              <span className="hidden sm:inline text-[#A197B4]">Weaviate Hybrid RAG</span>
              <span className="hidden sm:inline text-[#403854]">•</span>
              <span className="hidden sm:inline text-[#A197B4]">LangGraph Engine</span>
            </div>
            <button
              type="submit"
              disabled={loading || !goalInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Workflow</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Scenarios */}
        <div className="pt-2 border-t border-[rgba(139,92,246,0.15)] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C82A2]">
            Quick Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_GOALS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGoalInput(preset)}
                className="text-[11px] text-[#A197B4] hover:text-[#DDD6FE] bg-[#12101A] hover:bg-[#181421] border border-[rgba(139,92,246,0.18)] hover:border-[rgba(139,92,246,0.35)] rounded-xl px-2.5 py-1 transition-all text-left truncate max-w-xs"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-[#F87171] text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Execution Interrupted</div>
            <div className="text-[#FCA5A5] mt-0.5">{error}</div>
            {error.toLowerCase().includes("session") && (
              <button
                onClick={() => router.push("/login")}
                className="mt-2 text-[#A78BFA] underline hover:text-[#DDD6FE]"
              >
                Go to Login →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orchestrating — loading state with generic skeleton pipeline */}
      {loading && (
        <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.35)] bg-[#0C0A12]/80 backdrop-blur-md text-center space-y-4 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
          <Loader2 className="w-8 h-8 text-[#A78BFA] animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">LangGraph Execution In Progress</h3>
            <p className="text-xs text-[#8C82A2]">
              Analyzing goal intent • Retrieving Weaviate memory • Generating AI execution plan
            </p>
          </div>
          <div className="pt-2">
            {/* Generic skeleton — will be replaced with real nodes once plan loads */}
            <AgentGraphVisualizer pendingApprovals={[]} completedSteps={[]} />
          </div>
        </div>
      )}

      {/* Workflow Active — real-time view */}
      {workflow && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status & ID Bar */}
          <div className="p-4 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <div className="flex items-center gap-3">
              <StatusBadge status={workflow.status || "running"} />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#F5F3FF] truncate">{workflow.title || goalInput.slice(0, 60)}</h3>
                <p className="text-[10px] text-[#8C82A2] font-mono">ID: {workflow.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={() => workflowsApi.getWorkflow(workflow.id).then(setWorkflow)}
                className="text-xs text-[#8C82A2] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
              <button
                onClick={() => router.push(`/workflows/${workflow.id}`)}
                className="text-xs text-[#A78BFA] hover:text-[#DDD6FE] flex items-center gap-1 font-medium transition-colors"
              >
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LIVE Agent Graph — driven by real plan steps */}
          <div className="p-5 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] font-semibold">
                AI-Generated Execution Pipeline
              </span>
              {planSteps.length > 0 && (
                <span className="text-[10px] font-mono text-[#8C82A2]">
                  {completedSteps.length}/{planSteps.length} steps complete
                </span>
              )}
            </div>
            <AgentGraphVisualizer
              steps={planSteps}
              currentStepId={currentStepId}
              completedSteps={completedSteps}
              pendingApprovals={pendingApprovals}
            />
          </div>

          {/* Live Event Feed */}
          {liveEvents.length > 0 && (
            <div className="p-5 rounded-2xl border border-[rgba(139,92,246,0.15)] bg-[#0C0A12] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C82A2] font-semibold flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#A78BFA]" />
                Live Agent Events
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {liveEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-[#5A5070] font-mono shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={
                      ev.type.includes("completed") ? "text-[#34D399]" :
                      ev.type.includes("started") ? "text-[#A78BFA]" :
                      ev.type.includes("approval") ? "text-[#FBBF24]" :
                      ev.type.includes("error") ? "text-[#F87171]" : "text-[#DDD6FE]"
                    }>
                      {ev.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {pendingApprovals.length > 0 && (
            <div className="p-5 rounded-2xl border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.07)] space-y-3">
              <div className="flex items-center gap-2 text-[#FBBF24] font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                Human-in-the-Loop Approval Required
              </div>
              {pendingApprovals.map((ap: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-[#0C0A12] border border-[rgba(245,158,11,0.25)] space-y-2 text-xs">
                  <div className="text-[#DDD6FE] font-semibold">{ap.action}</div>
                  <div className="text-[#8C82A2]">{ap.reason}</div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => workflowsApi.approveWorkflowAction(workflow.id, ap.id || i.toString())}
                      className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => workflowsApi.rejectWorkflowAction(workflow.id, ap.id || i.toString())}
                      className="px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.3)] text-[#F87171] text-xs font-semibold transition-colors border border-[rgba(239,68,68,0.3)]"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Output Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Final Result + Plan Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Final Synthesized Result */}
              {workflow.final_result && (
                <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                    Synthesized Result
                  </h3>
                  <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.18)] text-xs text-[#DDD6FE] leading-relaxed whitespace-pre-wrap">
                    {typeof workflow.final_result === "string"
                      ? workflow.final_result
                      : JSON.stringify(workflow.final_result, null, 2)}
                  </div>
                </div>
              )}

              {/* AI-Generated Plan Steps from backend */}
              {planSteps.length > 0 && (
                <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#C4B5FD] font-semibold">
                    Generated Execution Plan
                  </h3>
                  <div className="space-y-2">
                    {planSteps.map((st, idx) => {
                      const isDone = completedSteps.includes(st.id);
                      const isActive = currentStepId === st.id;
                      return (
                        <div
                          key={st.id || idx}
                          className={`p-3 rounded-xl border flex items-start gap-3 text-xs transition-all ${
                            isDone
                              ? "border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]"
                              : isActive
                              ? "border-[rgba(139,92,246,0.5)] bg-[rgba(139,92,246,0.08)] animate-pulse"
                              : "border-[rgba(139,92,246,0.12)] bg-[#12101A]"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] shrink-0 border-[rgba(139,92,246,0.35)] text-[#DDD6FE]">
                            {isDone ? "✓" : idx + 1}
                          </span>
                          <div className="space-y-0.5 flex-1">
                            <div className="font-semibold text-[#F5F3FF] capitalize">
                              {(st as any).title || st.description || `${st.agent} — ${st.id}`}
                            </div>
                            {st.description && (st as any).title && (
                              <p className="text-[11px] text-[#8C82A2]">{st.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono text-[#6D5A9C] capitalize">
                                Agent: {st.agent}
                              </span>
                              {st.requires_approval && (
                                <span className="text-[10px] font-mono text-[#FBBF24]">🔒 HITL</span>
                              )}
                              {st.estimated_minutes && (
                                <span className="text-[10px] font-mono text-[#6D5A9C]">
                                  ~{st.estimated_minutes}m
                                </span>
                              )}
                            </div>
                          </div>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0 mt-0.5" />}
                          {isActive && <Clock className="w-3.5 h-3.5 text-[#A78BFA] animate-spin shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Telemetry */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C82A2] font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Run Telemetry
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { label: "Model", value: selectedModel.split("-").slice(0, 3).join("-"), color: "text-[#A78BFA]" },
                    { label: "Status", value: workflow.status, color: workflow.status === "completed" ? "text-[#34D399]" : workflow.status === "failed" ? "text-[#F87171]" : "text-[#FBBF24]" },
                    { label: "Steps", value: `${completedSteps.length}/${planSteps.length}`, color: "text-[#C4B5FD]" },
                    { label: "Tokens", value: totalTokens > 0 ? totalTokens.toLocaleString() : "—", color: "text-[#C4B5FD]" },
                    { label: "Est. Cost", value: estimatedCost > 0 ? `$${estimatedCost.toFixed(4)}` : "—", color: "text-[#DDD6FE]" },
                    { label: "Checkpointer", value: "PostgreSQL", color: "text-[#DDD6FE]" },
                    { label: "Vector DB", value: "Weaviate", color: "text-[#DDD6FE]" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between p-2 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.1)]">
                      <span className="text-[#8C82A2]">{label}:</span>
                      <span className={color}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DB-backed steps from workflow.steps */}
              {workflow.steps?.length > 0 && (
                <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12] space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#34D399] font-semibold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    DB-Persisted Steps
                  </h3>
                  <div className="space-y-2">
                    {workflow.steps.map((s: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl border border-[rgba(139,92,246,0.12)] bg-[#12101A] text-xs">
                        <div className="font-semibold text-[#F5F3FF] capitalize">{s.step_name || s.title || s.id}</div>
                        <div className="text-[10px] text-[#8C82A2] capitalize mt-0.5">{s.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommandCenterPage() {
  return (
    <Suspense fallback={<div className="text-[#DDD6FE] text-xs font-mono">Loading Command Center...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}
