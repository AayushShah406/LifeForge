"use client";

import { CheckCircle2, Circle, AlertCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Agent display metadata — maps agent key to display name and role
const AGENT_DISPLAY: Record<string, { name: string; role: string }> = {
  research:      { name: "Research Agent",    role: "Web Intelligence & Retrieval" },
  document:      { name: "Document Agent",    role: "Entity & Content Extraction" },
  interview:     { name: "Interview Agent",   role: "Q&A & Assessment Synthesis" },
  planning:      { name: "Planning Agent",    role: "Schedule & Milestone Design" },
  calendar:      { name: "Calendar Agent",    role: "Availability & Event Planning" },
  email:         { name: "Email Agent",       role: "Drafting & Communication" },
  memory:        { name: "Memory Agent",      role: "Semantic Context Retrieval" },
  verification:  { name: "Verifier",          role: "Quality & Accuracy Check" },
  supervisor:    { name: "Supervisor",        role: "Intent Routing" },
};

// Derive a display name from an agent key or step description
function resolveAgentDisplay(agent: string, description?: string): { name: string; role: string } {
  const key = (agent || "").toLowerCase().replace("_agent", "").trim();
  if (AGENT_DISPLAY[key]) return AGENT_DISPLAY[key];
  // Fallback: capitalize the agent name
  const name = agent
    .replace(/_agent$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) + " Agent";
  return { name, role: description?.slice(0, 40) || "Task Execution" };
}

export interface PlanStepNode {
  id: string;
  agent: string;
  description?: string;
  status?: string;
  requires_approval?: boolean;
  dependencies?: string[];
}

interface AgentGraphVisualizerProps {
  /** Plan steps from backend — renders the real dynamic pipeline */
  steps?: PlanStepNode[];
  /** Currently executing step ID */
  currentStepId?: string;
  /** IDs of completed steps */
  completedSteps?: string[];
  /** Pending approval items */
  pendingApprovals?: any[];
  /** Verification results keyed by step_id */
  verificationResults?: Record<string, any>;
}

export function AgentGraphVisualizer({
  steps,
  currentStepId,
  completedSteps = [],
  pendingApprovals = [],
  verificationResults = {},
}: AgentGraphVisualizerProps) {

  // If real steps are provided, use them; otherwise show a generic loading skeleton
  const nodes: PlanStepNode[] = steps && steps.length > 0
    ? steps
    : [
        { id: "intent_analysis",  agent: "supervisor",    description: "Analyzing goal intent" },
        { id: "planning",         agent: "planning",      description: "Generating execution plan" },
        { id: "execution",        agent: "research",      description: "Executing workflow steps" },
        { id: "verification",     agent: "verification",  description: "Verifying outputs" },
        { id: "synthesis",        agent: "supervisor",    description: "Synthesizing final result" },
      ];

  function resolveStatus(node: PlanStepNode): "pending" | "running" | "completed" | "awaiting_approval" | "needs_revision" {
    if (node.status === "needs_revision") return "needs_revision";
    if (completedSteps.includes(node.id)) return "completed";
    if (currentStepId === node.id) {
      if (pendingApprovals.length > 0 && node.requires_approval) return "awaiting_approval";
      return "running";
    }
    if (node.status === "completed") return "completed";
    if (node.status === "running") return "running";
    return "pending";
  }

  return (
    <div className="w-full overflow-x-auto py-3 custom-scrollbar">
      <div className="flex items-center gap-2 min-w-max">
        {nodes.map((node, index) => {
          const status = resolveStatus(node);
          const isCompleted = status === "completed";
          const isRunning = status === "running";
          const isAwaiting = status === "awaiting_approval";
          const isRevision = status === "needs_revision";
          const verif = verificationResults[node.id];
          const display = resolveAgentDisplay(node.agent, node.description);

          return (
            <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={cn(
                  "w-[155px] p-3 rounded-xl border transition-all relative overflow-hidden backdrop-blur-md",
                  isCompleted && "border-[rgba(16,185,129,0.45)] bg-[rgba(16,185,129,0.08)] shadow-[0_0_15px_rgba(16,185,129,0.12)]",
                  isRunning && "border-[#8B5CF6] bg-[rgba(139,92,246,0.18)] shadow-[0_0_25px_rgba(139,92,246,0.35)] animate-pulse",
                  isAwaiting && "border-[rgba(245,158,11,0.6)] bg-[rgba(245,158,11,0.12)] shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                  isRevision && "border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] shadow-[0_0_15px_rgba(239,68,68,0.15)]",
                  status === "pending" && "border-[rgba(139,92,246,0.15)] bg-[#0C0A12]/80 opacity-55",
                )}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[#8C82A2]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />}
                  {isRunning && <Clock className="w-3.5 h-3.5 text-[#A78BFA] animate-spin" />}
                  {isAwaiting && <AlertCircle className="w-3.5 h-3.5 text-[#FBBF24]" />}
                  {isRevision && <AlertCircle className="w-3.5 h-3.5 text-[#F87171]" />}
                  {status === "pending" && <Circle className="w-3 h-3 text-[#5A5070]" />}
                </div>

                {/* Agent name */}
                <div className="text-xs font-semibold text-[#F5F3FF] leading-tight truncate">{display.name}</div>
                <div className="text-[10px] text-[#8C82A2] truncate mt-0.5">{display.role}</div>

                {/* Status label */}
                <div className="mt-1.5 text-[10px] font-mono">
                  {isCompleted && <span className="text-[#34D399]">✓ Verified</span>}
                  {isRunning && <span className="text-[#A78BFA]">◉ Reasoning</span>}
                  {isAwaiting && <span className="text-[#FBBF24]">⏳ HITL Review</span>}
                  {isRevision && <span className="text-[#F87171]">↻ Revision</span>}
                  {status === "pending" && <span className="text-[#5A5070]">◌ Pending</span>}
                </div>

                {/* Verification badge */}
                {verif && (
                  <div className="mt-1.5 pt-1.5 border-t border-[rgba(139,92,246,0.2)] flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1 text-[#8C82A2]">
                      <ShieldCheck className="w-3 h-3 text-[#34D399]" />
                      Conf.
                    </span>
                    <span className="font-mono text-[#C4B5FD] font-semibold">
                      {Math.round((verif.confidence || 0.95) * 100)}%
                    </span>
                  </div>
                )}

                {/* HITL approval badge */}
                {node.requires_approval && !isCompleted && (
                  <div className="mt-1 text-[10px] font-mono text-[#FBBF24] opacity-80">
                    🔒 Approval Gate
                  </div>
                )}
              </div>

              {index < nodes.length - 1 && (
                <ArrowRight
                  className={cn(
                    "w-3.5 h-3.5 shrink-0 flex-shrink-0 transition-colors",
                    isCompleted ? "text-[#10B981]" : isRunning ? "text-[#A78BFA] animate-pulse" : "text-[#403854]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
