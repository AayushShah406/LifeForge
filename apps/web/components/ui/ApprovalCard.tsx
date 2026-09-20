import React from "react";
import { Calendar, Mail, Trash2, Cpu, Check, X, ShieldAlert } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ApprovalCardProps {
  id: string;
  actionType: string;
  toolName: string;
  workflowTitle?: string;
  agent?: string;
  parameters?: any;
  reason?: string;
  timestamp?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading?: boolean;
}

export function ApprovalCard({
  id,
  actionType,
  toolName,
  workflowTitle,
  agent = "Planning Agent",
  parameters,
  reason,
  timestamp,
  onApprove,
  onReject,
  loading = false,
}: ApprovalCardProps) {
  const getIcon = () => {
    if (toolName.includes("calendar") || actionType.includes("calendar")) return Calendar;
    if (toolName.includes("email") || actionType.includes("email")) return Mail;
    if (toolName.includes("delete") || actionType.includes("delete")) return Trash2;
    return Cpu;
  };

  const Icon = getIcon();

  return (
    <div className="p-5 rounded-2xl border border-[rgba(245,158,11,0.35)] bg-[#0C0A12]/95 backdrop-blur-md space-y-4 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.35)] text-[#FBBF24] shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#F5F3FF] capitalize">{toolName.replace(/_/g, " ")}</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.18)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)] font-semibold">
                HITL Required
              </span>
            </div>
            <p className="text-xs text-[#8C82A2] mt-0.5">
              Requested by <span className="text-[#DDD6FE] font-medium">{agent}</span>
              {workflowTitle && <> for <span className="text-[#A78BFA]">‘{workflowTitle}’</span></>}
            </p>
          </div>
        </div>

        {timestamp && <span className="text-[11px] font-mono text-[#8C82A2]">{timestamp}</span>}
      </div>

      {reason && (
        <div className="p-3 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.2)] text-xs text-[#DDD6FE] leading-relaxed">
          <span className="font-semibold text-[#A78BFA] block mb-0.5">Agent Justification:</span>
          {reason}
        </div>
      )}

      {parameters && Object.keys(parameters).length > 0 && (
        <div className="space-y-1 font-mono text-[11px] bg-[#181421] p-2.5 rounded-xl border border-[rgba(139,92,246,0.18)]">
          {Object.entries(parameters).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-[#8C82A2]">{k}:</span>
              <span className="text-[#DDD6FE] truncate max-w-[240px]">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => onReject(id)}
          className="hover:border-[#EF4444]/60 hover:text-[#F87171] border-[rgba(239,68,68,0.3)] text-[#F87171]"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Reject
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => onApprove(id)}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          Approve Action
        </Button>
      </div>
    </div>
  );
}
