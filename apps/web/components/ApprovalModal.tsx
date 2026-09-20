"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Calendar, Mail, ShieldAlert } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  approval: {
    id: string;
    action_type: string;
    title: string;
    description: string;
    payload?: any;
  } | null;
  onApprove: (approvalId: string, comment?: string) => Promise<void>;
  onReject: (approvalId: string, comment?: string) => Promise<void>;
  onClose: () => void;
}

export function ApprovalModal({
  isOpen,
  approval,
  onApprove,
  onReject,
  onClose,
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !approval) return null;

  const isCalendar = approval.action_type.includes("calendar");
  const isEmail = approval.action_type.includes("email");

  const handleAction = async (decision: "approve" | "reject") => {
    setLoading(true);
    try {
      if (decision === "approve") {
        await onApprove(approval.id, comment);
      } else {
        await onReject(approval.id, comment);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07060B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0C0A12] border border-[rgba(245,158,11,0.4)] w-full max-w-lg rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.35)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            {isCalendar ? (
              <Calendar className="w-6 h-6 text-[#FBBF24]" />
            ) : isEmail ? (
              <Mail className="w-6 h-6 text-[#FBBF24]" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-[#FBBF24]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(245,158,11,0.18)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)] font-semibold">
                HUMAN-IN-THE-LOOP AUTHORIZATION
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F3FF] mt-1">{approval.title}</h3>
            <p className="text-xs text-[#8C82A2]">
              LangGraph paused workflow execution awaiting your explicit authorization.
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] space-y-2">
          <p className="text-sm text-[#DDD6FE] whitespace-pre-line leading-relaxed">
            {approval.description}
          </p>
          {approval.payload && Object.keys(approval.payload).length > 0 && (
            <div className="mt-2 pt-2 border-t border-[rgba(139,92,246,0.15)]">
              <span className="text-[11px] font-mono text-[#A78BFA] uppercase tracking-wider">
                Mutation Payload:
              </span>
              <pre className="text-[11px] font-mono bg-[#181421] p-2.5 rounded-xl text-[#DDD6FE] overflow-x-auto mt-1 border border-[rgba(139,92,246,0.2)] custom-scrollbar">
                {JSON.stringify(approval.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Optional Comment Input */}
        <div>
          <label className="block text-xs text-[#8C82A2] mb-1">
            Approver Note / Instructions (Optional):
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g., Looks solid, please execute."
            className="w-full text-sm bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl px-3.5 py-2.5 text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => handleAction("reject")}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[rgba(239,68,68,0.35)] text-[#F87171] hover:bg-[rgba(239,68,68,0.1)] text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Reject Action
          </button>
          <button
            onClick={() => handleAction("approve")}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Authorize & Execute
          </button>
        </div>
      </div>
    </div>
  );
}
