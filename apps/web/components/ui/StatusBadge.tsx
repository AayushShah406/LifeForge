import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "violet" | "cyan" | "indigo" | "emerald" | "amber" | "rose" | "slate" | "purple";
  pulse?: boolean;
}

export function Badge({ className, variant = "slate", pulse = false, children, ...props }: BadgeProps) {
  const variants = {
    violet: "bg-[rgba(139,92,246,0.18)] text-[#DDD6FE] border-[rgba(139,92,246,0.35)] shadow-[0_0_10px_rgba(139,92,246,0.2)]",
    cyan: "bg-[rgba(139,92,246,0.18)] text-[#DDD6FE] border-[rgba(139,92,246,0.35)] shadow-[0_0_10px_rgba(139,92,246,0.2)]",
    indigo: "bg-[#6D28D9]/20 text-[#C4B5FD] border-[#6D28D9]/40",
    purple: "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/40",
    emerald: "bg-[rgba(16,185,129,0.12)] text-[#34D399] border-[rgba(16,185,129,0.3)] shadow-[0_0_8px_rgba(16,185,129,0.15)]",
    amber: "bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border-[rgba(245,158,11,0.35)] shadow-[0_0_8px_rgba(245,158,11,0.15)]",
    rose: "bg-[rgba(239,68,68,0.15)] text-[#F87171] border-[rgba(239,68,68,0.35)]",
    slate: "bg-[#181421] text-[#A197B4] border-[rgba(139,92,246,0.18)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "unknown").toLowerCase();

  if (normalized === "completed" || normalized === "approved" || normalized === "healthy" || normalized === "indexed") {
    return <Badge variant="emerald" pulse={false}>✓ {status || "Completed"}</Badge>;
  }

  if (normalized === "running" || normalized === "in_progress" || normalized === "parsing" || normalized === "embedding" || normalized === "active") {
    return <Badge variant="violet" pulse={true}>● {status || "Running"}</Badge>;
  }

  if (normalized === "waiting_approval" || normalized === "pending" || normalized === "needs_revision") {
    return <Badge variant="amber" pulse={true}>⏳ {status || "Waiting"}</Badge>;
  }

  if (normalized === "failed" || normalized === "rejected" || normalized === "degraded") {
    return <Badge variant="rose" pulse={false}>✕ {status || "Failed"}</Badge>;
  }

  return <Badge variant="slate">{status || "Unknown"}</Badge>;
}
