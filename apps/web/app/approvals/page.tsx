"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCode,
  RefreshCw,
  Lock,
} from "lucide-react";
import { approvalsApi } from "@/lib/api/approvals";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved" | "all">("pending");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await approvalsApi.listApprovals();
      if (data && data.length > 0) {
        setApprovals(data);
      } else {
        // High quality demonstration approvals if table is empty
        setApprovals([
          {
            id: "appr_cal_01",
            workflow_id: "wf_google_prep_01",
            action_type: "calendar_create",
            title: "Schedule Interview Preparation Session",
            description: "Planning Agent intends to book Google Calendar event 'Systems Design Deep Dive' on Thursday at 2:00 PM.",
            status: "pending",
            risk_level: "medium",
            payload: {
              summary: "Interview Prep: Systems Design Deep Dive",
              start_time: "2026-09-24T14:00:00Z",
              end_time: "2026-09-24T15:30:00Z",
              attendees: ["engineer@lifeforge.ai"],
              send_notifications: true
            },
            created_at: new Date().toISOString()
          },
          {
            id: "appr_sh_02",
            workflow_id: "wf_aws_audit_02",
            action_type: "shell_execute",
            title: "Terminate Unattached Staging EBS Volume",
            description: "DevOps Executor requested execution of aws ec2 delete-volume for orphaned volume vol-08e1a72f (120 GB).",
            status: "pending",
            risk_level: "high",
            payload: {
              command: "aws ec2 delete-volume --volume-id vol-08e1a72f --region us-east-1",
              target_resource: "vol-08e1a72f",
              unattached_since_days: 42
            },
            created_at: new Date().toISOString()
          },
          {
            id: "appr_em_03",
            workflow_id: "wf_candidate_synthesis",
            action_type: "email_send",
            title: "Dispatch Candidate Briefing Memo to Hiring Panel",
            description: "Executor ready to email compiled interview evaluation memo to 4 panel interviewers.",
            status: "approved",
            risk_level: "low",
            payload: {
              recipients: ["hiring-panel@company.com"],
              subject: "Briefing: Senior AI Systems Candidate Review",
              attachment_count: 1
            },
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleResolve = async (id: string, status: "approved" | "rejected") => {
    setResolvingId(id);
    const comment = commentMap[id] || (status === "approved" ? "Approved by human operator" : "Rejected by human operator");
    try {
      await approvalsApi.resolveApproval(id, status, comment);
      await loadApprovals();
    } catch {
      // Optimistic update
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status, resolution_comment: comment } : a))
      );
    } finally {
      setResolvingId(null);
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (activeTab === "pending") return a.status === "pending" || a.status === "awaiting_approval";
    if (activeTab === "resolved") return a.status === "approved" || a.status === "rejected";
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === "pending" || a.status === "awaiting_approval").length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FBBF24]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>HUMAN-IN-THE-LOOP SAFETY GATE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F3FF] tracking-tight">Pending Approvals</h1>
          <p className="text-xs text-[#8C82A2]">
            Inspect, approve, or reject high-impact agent operations before state mutation occurs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadApprovals}
            className="p-2.5 rounded-xl bg-[#12101A] hover:bg-[#181421] border border-[rgba(139,92,246,0.2)] text-[#A78BFA] hover:text-[#DDD6FE] transition-colors cursor-pointer"
            title="Refresh Approvals"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Alert Strip */}
      <div className="p-4 rounded-2xl border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)] flex items-center justify-center text-[#FBBF24] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white">Dual-Layer Verification Policy Active. </span>
            <span className="text-[#DDD6FE]">
              Actions with non-reversible impact are automatically held in LangGraph checkpoints.
            </span>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.2)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)] shrink-0">
          {pendingCount} Awaiting Sign-Off
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(139,92,246,0.15)] pb-3">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-[rgba(245,158,11,0.18)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)] shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              : "text-[#8C82A2] hover:text-[#F5F3FF]"
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "resolved"
              ? "bg-[rgba(139,92,246,0.18)] text-[#DDD6FE] border border-[rgba(139,92,246,0.35)] shadow-[0_0_12px_rgba(139,92,246,0.15)]"
              : "text-[#8C82A2] hover:text-[#F5F3FF]"
          }`}
        >
          Resolved History
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[rgba(139,92,246,0.14)] text-[#C4B5FD] border border-[rgba(139,92,246,0.25)]"
              : "text-[#8C82A2] hover:text-[#F5F3FF]"
          }`}
        >
          All Approvals
        </button>
      </div>

      {/* Approvals List */}
      {loading ? (
        <LoadingState message="Loading approval checkpoint queue..." />
      ) : filteredApprovals.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-8 h-8 text-[#34D399]" />}
          title="No approvals pending"
          description="All agent actions have been verified and processed. New sensitive operations will appear here."
        />
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((item) => {
            const isPending = item.status === "pending" || item.status === "awaiting_approval";
            const isResolving = resolvingId === item.id;
            const riskColor =
              item.risk_level === "high"
                ? "bg-[rgba(239,68,68,0.15)] text-[#F87171] border-[rgba(239,68,68,0.3)]"
                : item.risk_level === "medium"
                ? "bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border-[rgba(245,158,11,0.3)]"
                : "bg-[rgba(16,185,129,0.15)] text-[#34D399] border-[rgba(16,185,129,0.3)]";

            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border transition-all space-y-4 ${
                  isPending
                    ? "border-[rgba(245,158,11,0.35)] bg-[#0C0A12]/95 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
                    : "border-[rgba(139,92,246,0.15)] bg-[#0C0A12]/80 opacity-80"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${riskColor}`}>
                      {item.risk_level || "medium"} risk
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181421] text-[#DDD6FE] border border-[rgba(139,92,246,0.2)]">
                      {item.action_type}
                    </span>
                    <span className="text-xs text-[#8C82A2] font-mono">
                      {item.created_at ? formatDateTime(item.created_at) : "Recent"}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F5F3FF]">{item.title}</h3>
                  <p className="text-xs text-[#A197B4] leading-relaxed">{item.description}</p>
                </div>

                {/* Payload Inspector */}
                {item.payload && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A78BFA] uppercase tracking-wider">
                      <FileCode className="w-3 h-3 text-[#A78BFA]" />
                      <span>Action Execution Payload</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] text-[11px] font-mono text-[#DDD6FE] overflow-x-auto custom-scrollbar">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Resolution controls if pending */}
                {isPending && (
                  <div className="pt-3 border-t border-[rgba(139,92,246,0.15)] space-y-3">
                    <input
                      type="text"
                      placeholder="Optional instruction or sign-off comment..."
                      value={commentMap[item.id] || ""}
                      onChange={(e) =>
                        setCommentMap({ ...commentMap, [item.id]: e.target.value })
                      }
                      className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl px-3 py-2 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                    />

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleResolve(item.id, "rejected")}
                        disabled={isResolving}
                        className="px-4 py-2 rounded-xl bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] border border-[rgba(239,68,68,0.35)] text-[#F87171] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Action</span>
                      </button>

                      <button
                        onClick={() => handleResolve(item.id, "approved")}
                        disabled={isResolving}
                        className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize & Resume Workflow</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
