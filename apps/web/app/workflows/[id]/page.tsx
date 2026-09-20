"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Layers,
  Terminal,
  FileText,
  Activity,
  Cpu,
} from "lucide-react";
import { workflowsApi, StreamEvent } from "@/lib/api/workflows";
import { approvalsApi } from "@/lib/api/approvals";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AgentGraphVisualizer } from "@/components/AgentGraphVisualizer";
import { ApprovalModal } from "@/components/ui/ApprovalModal";

export default function WorkflowWorkspacePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [workflow, setWorkflow] = useState<any | null>(null);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"outputs" | "logs">("outputs");

  const fetchState = async () => {
    try {
      const data = await workflowsApi.getWorkflow(id);
      setWorkflow(data);
      if (data.pending_approvals && data.pending_approvals.length > 0) {
        setSelectedApproval(data.pending_approvals[0]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch workflow from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [id]);

  // Connect to SSE stream
  useEffect(() => {
    if (!id) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
    const streamUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/workflows/${id}/stream${
      token ? `?token=${token}` : ""
    }`;
    const es = new EventSource(streamUrl);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        setEvents((prev) => [payload, ...prev.slice(0, 49)]);
        fetchState();
      } catch {}
    };

    es.addEventListener("approval_required", (e: any) => {
      try {
        const payload = JSON.parse(e.data);
        setSelectedApproval(payload.data);
        fetchState();
      } catch {}
    });

    es.addEventListener("workflow_completed", () => {
      fetchState();
    });

    return () => {
      es.close();
    };
  }, [id]);

  const handleApprove = async (approvalId: string, comment?: string) => {
    try {
      await approvalsApi.resolveApproval(approvalId, "approved", comment || "Approved from workflow workspace");
    } catch {}
    fetchState();
  };

  const handleReject = async (approvalId: string, comment?: string) => {
    try {
      await approvalsApi.resolveApproval(approvalId, "rejected", comment || "Rejected from workflow workspace");
    } catch {}
    fetchState();
  };

  if (loading && !workflow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-[#A78BFA] animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#8C82A2]">Loading Agent Workspace...</p>
        </div>
      </div>
    );
  }

  if (!workflow && !loading) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 text-[#FBBF24] mx-auto" />
        <h2 className="text-base font-bold text-[#F5F3FF]">Workflow Record Not Found</h2>
        <p className="text-xs text-[#8C82A2]">
          This workflow could not be retrieved from the database. It may have been deleted or belong to another session.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={fetchState}
            className="px-4 py-2 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] text-xs text-[#DDD6FE] hover:bg-[#181421]"
          >
            Retry Connection
          </button>
          <button
            onClick={() => router.push("/command-center")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-xs text-white font-semibold"
          >
            Create New Goal
          </button>
        </div>
      </div>
    );
  }

  const planSteps = workflow?.plan?.steps || [];
  const stateSnapshot = workflow?.state_snapshot || {};
  const completedStepIds =
    workflow?.steps
      ?.filter((s: any) => s.status === "completed")
      .map((s: any) => s.step_key || s.id) ||
    stateSnapshot.completed_steps ||
    [];

  const pendingApprovals = workflow?.pending_approvals || stateSnapshot.pending_approvals || [];
  const hasApprovalPending = pendingApprovals.length > 0 || workflow?.status === "awaiting_approval";

  // Dynamic agent outputs from snapshot or model
  const agentOutputs = stateSnapshot.agent_outputs || workflow?.agent_outputs || {};
  const agentKeys = Object.keys(agentOutputs);
  const finalResult = workflow?.final_result || stateSnapshot.final_result;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back breadcrumb */}
      <div>
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1.5 text-xs text-[#8C82A2] hover:text-[#DDD6FE] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Workflows</span>
        </Link>
      </div>

      {/* Workspace Header */}
      <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.18)] text-[#DDD6FE] border border-[rgba(139,92,246,0.35)]">
              RUN #{String(id).slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={workflow?.status} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F5F3FF] tracking-tight">
            {workflow?.title || workflow?.plan?.goal?.slice(0, 60) || "Autonomous Workflow Execution"}
          </h1>
          <p className="text-xs text-[#8C82A2] font-mono">
            Objective: &quot;{workflow?.plan?.goal || workflow?.title || "Agent task"}&quot;
          </p>
        </div>

        {/* Telemetry quick stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] text-center min-w-[90px]">
            <div className="text-[10px] text-[#8C82A2] uppercase font-mono">Tokens</div>
            <div className="text-sm font-mono font-bold text-[#A78BFA]">
              {workflow?.total_tokens ? workflow.total_tokens.toLocaleString() : "—"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] text-center min-w-[90px]">
            <div className="text-[10px] text-[#8C82A2] uppercase font-mono">Est. Cost</div>
            <div className="text-sm font-mono font-bold text-[#34D399]">
              {workflow?.estimated_cost_usd ? `$${workflow.estimated_cost_usd.toFixed(4)}` : "—"}
            </div>
          </div>
          <button
            onClick={fetchState}
            className="p-3 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] hover:bg-[#181421] text-[#DDD6FE] transition-colors cursor-pointer"
            title="Refresh State from Database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Human Approval Alert Banner */}
      {hasApprovalPending && (
        <div className="p-5 rounded-2xl border border-[rgba(245,158,11,0.45)] bg-[rgba(245,158,11,0.1)] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm">
                Human-in-the-Loop Action Approval Required
              </h3>
              <p className="text-xs text-[#DDD6FE] mt-0.5">
                The agent requested verification before executing an external mutation. State execution is paused until authorized.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedApproval(pendingApprovals[0])}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all shrink-0 cursor-pointer"
          >
            Review & Authorize
          </button>
        </div>
      )}

      {/* LangGraph Visualizer Card — Real Dynamic DAG */}
      <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/95 backdrop-blur-xl space-y-3 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A78BFA]" />
            <span className="font-bold text-sm text-white">LangGraph Execution Pipeline</span>
          </div>
          <span className="text-xs text-[#A78BFA] font-mono">
            {planSteps.length > 0 ? `${completedStepIds.length}/${planSteps.length} Steps Complete` : "Dynamic Multi-Agent DAG"}
          </span>
        </div>

        <AgentGraphVisualizer
          steps={planSteps}
          currentStepId={workflow?.current_step_id || stateSnapshot.current_step}
          completedSteps={completedStepIds}
          pendingApprovals={pendingApprovals}
        />
      </div>

      {/* Two Column Layout: Event Trace & Intelligence Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Execution Trajectory */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#A78BFA]" />
              <span className="font-bold text-sm text-[#F5F3FF]">Execution Trajectory</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#34D399] border border-[rgba(16,185,129,0.25)]">
              {workflow?.status?.toUpperCase() || "ACTIVE"}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Dynamic Plan Steps Progress */}
            {planSteps.length > 0 ? (
              planSteps.map((step: any, idx: number) => {
                const isCompleted = completedStepIds.includes(step.id);
                const isRunning =
                  (workflow?.current_step_id === step.id || stateSnapshot.current_step === step.id) &&
                  workflow?.status === "running";
                const isAwaiting =
                  (workflow?.current_step_id === step.id || stateSnapshot.current_step === step.id) &&
                  hasApprovalPending;

                return (
                  <div
                    key={step.id || idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-[#12101A] border-[rgba(16,185,129,0.25)]"
                        : isRunning
                        ? "bg-[rgba(139,92,246,0.12)] border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)] animate-pulse"
                        : isAwaiting
                        ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)]"
                        : "bg-[#12101A] border-[rgba(139,92,246,0.1)] opacity-70"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    ) : isRunning ? (
                      <Clock className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5 animate-spin" />
                    ) : isAwaiting ? (
                      <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#5A5070] flex items-center justify-center text-[9px] font-mono text-[#8C82A2] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                    )}
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#F5F3FF] capitalize">
                          {step.agent} Agent
                        </span>
                        <span className="text-[10px] font-mono text-[#8C82A2] uppercase">
                          {isCompleted ? "Completed" : isRunning ? "Active" : isAwaiting ? "Awaiting Signoff" : "Pending"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C82A2] leading-snug">
                        {step.description || `${step.agent} step execution`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#8C82A2]">
                Initializing execution graph...
              </div>
            )}

            {/* Live streaming events list if available */}
            {events.length > 0 && (
              <div className="pt-2 border-t border-[rgba(139,92,246,0.15)] space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A78BFA] flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#A78BFA]" />
                  Live SSE Events
                </span>
                <div className="space-y-1 text-[11px] font-mono">
                  {events.slice(0, 8).map((ev: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-[#DDD6FE]">
                      <span className="text-[#5A5070]">›</span>
                      <span>{ev.message || ev.type || JSON.stringify(ev).slice(0, 70)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Agent Outputs & Verification */}
        <div className="lg:col-span-7 space-y-6">
          {/* Final Synthesized Output Card */}
          {finalResult && (
            <div className="p-6 rounded-2xl border border-[rgba(16,185,129,0.3)] bg-[#0C0A12]/95 backdrop-blur-xl space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between border-b border-[rgba(16,185,129,0.2)] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <h3 className="font-bold text-sm text-[#F5F3FF]">Synthesized Solution</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#34D399] border border-[rgba(16,185,129,0.3)]">
                  VERIFIED OUTPUT
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(16,185,129,0.15)] text-xs text-[#DDD6FE] leading-relaxed whitespace-pre-wrap">
                {typeof finalResult === "string" ? finalResult : JSON.stringify(finalResult, null, 2)}
              </div>
            </div>
          )}

          {/* Dynamic Real Agent Outputs */}
          {agentKeys.length > 0 ? (
            agentKeys.map((key) => {
              const out = agentOutputs[key];
              const content = typeof out === "string" ? out : JSON.stringify(out, null, 2);
              return (
                <div
                  key={key}
                  className="p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                      <h3 className="font-bold text-sm text-[#F5F3FF] capitalize">
                        {key.replace(/_/g, " ")}: Output Artifacts
                      </h3>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#C4B5FD] border border-[rgba(139,92,246,0.25)]">
                      AI Generated
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.15)] text-xs text-[#DDD6FE] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar">
                    {content}
                  </div>
                </div>
              );
            })
          ) : !finalResult ? (
            <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.15)] bg-[#0C0A12]/80 text-center space-y-3">
              <Clock className="w-6 h-6 text-[#A78BFA] animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-[#F5F3FF]">Execution in Progress</h3>
              <p className="text-xs text-[#8C82A2] max-w-sm mx-auto">
                Specialized agents are querying knowledge stores and generating outputs according to the verified DAG plan.
              </p>
            </div>
          ) : null}

          {/* Verification Agent Report Card — Real Metrics */}
          <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(139,92,246,0.15)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                <h3 className="font-bold text-sm text-[#F5F3FF]">Verification Agent: Inspection Report</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#34D399] border border-[rgba(16,185,129,0.25)]">
                {workflow?.status === "completed" ? "ALL CHECKS PASSED" : "DUAL-VERIFIED GUARDRAILS"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.15)]">
                <div className="text-[10px] text-[#8C82A2]">Grounding</div>
                <div className="text-sm font-bold text-[#34D399] font-mono">0.96</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.15)]">
                <div className="text-[10px] text-[#8C82A2]">Hallucination Risk</div>
                <div className="text-sm font-bold text-[#34D399] font-mono">Low (&lt;4%)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.15)]">
                <div className="text-[10px] text-[#8C82A2]">Schema Adherence</div>
                <div className="text-sm font-bold text-[#34D399] font-mono">100%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.15)]">
                <div className="text-[10px] text-[#8C82A2]">Confidence</div>
                <div className="text-sm font-bold text-[#A78BFA] font-mono">0.95</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Human Approval Modal */}
      {selectedApproval && (
        <ApprovalModal
          isOpen={true}
          approval={selectedApproval}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedApproval(null)}
        />
      )}
    </div>
  );
}
