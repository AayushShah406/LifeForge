import React from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolCardProps {
  name: string;
  server: string;
  description: string;
  permission: string;
  callsTotal?: number;
  successRate?: string;
  status?: string;
  onInspect?: () => void;
}

export function ToolCard({
  name,
  server,
  description,
  permission,
  callsTotal,
  successRate,
  status = "Connected ✓",
  onInspect,
}: ToolCardProps) {
  const isApprovalRequired = permission.toLowerCase().includes("approval") || permission.toLowerCase().includes("tier 2");

  return (
    <div className="p-5 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 backdrop-blur-md hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.25)] text-[#A78BFA]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#F5F3FF] font-mono">{name}</h4>
            <span className="text-[11px] text-[#8C82A2]">{server}</span>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full border",
            isApprovalRequired
              ? "bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border-[rgba(245,158,11,0.35)]"
              : "bg-[rgba(16,185,129,0.12)] text-[#34D399] border-[rgba(16,185,129,0.3)]"
          )}
        >
          {permission}
        </span>
      </div>

      <p className="text-xs text-[#A197B4] line-clamp-2 leading-relaxed">{description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-[rgba(139,92,246,0.15)] text-xs font-mono text-[#8C82A2]">
        <div>
          <span>Calls: </span>
          <span className="text-[#DDD6FE] font-bold">{callsTotal ?? 0}</span>
        </div>
        {successRate && (
          <div>
            <span>Success: </span>
            <span className="text-[#34D399] font-bold">{successRate}</span>
          </div>
        )}
        {onInspect && (
          <button
            onClick={onInspect}
            className="text-[#A78BFA] hover:text-[#C4B5FD] font-sans font-medium text-xs underline"
          >
            Inspect
          </button>
        )}
      </div>
    </div>
  );
}
