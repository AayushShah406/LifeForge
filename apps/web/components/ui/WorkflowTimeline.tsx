import React from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id?: string;
  type: string;
  message?: string;
  agent?: string;
  timestamp?: string;
  status?: "completed" | "running" | "pending" | "failed";
}

export function WorkflowTimeline({ events = [] }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs font-mono text-[#8C82A2]">
        Waiting for workflow execution to start...
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#8B5CF6]/50 before:via-[#A78BFA]/30 before:to-[#8B5CF6]/10">
      {events.map((ev, idx) => {
        const isRunning = ev.status === "running";
        const isCompleted = ev.status === "completed" || (!ev.status && idx < events.length - 1);
        const isFailed = ev.status === "failed";

        return (
          <div key={idx} className="relative flex items-start gap-3 text-xs">
            <div
              className={cn(
                "absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center bg-[#07060B] border",
                isRunning && "border-[#8B5CF6] text-[#A78BFA] shadow-[0_0_10px_rgba(139,92,246,0.6)]",
                isCompleted && "border-[#10B981] text-[#34D399]",
                isFailed && "border-[#EF4444] text-[#F87171]",
                !isRunning && !isCompleted && !isFailed && "border-[#403854] text-[#5A5070]"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : isRunning ? (
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
              ) : isFailed ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Circle className="w-2 h-2" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-[#F5F3FF] capitalize truncate">
                  {ev.type.replace(/_/g, " ")}
                </span>
                {ev.timestamp && (
                  <span className="text-[10px] font-mono text-[#8C82A2] shrink-0">
                    {ev.timestamp.split("T")[1]?.slice(0, 8) || ev.timestamp}
                  </span>
                )}
              </div>
              {ev.message && <p className="text-[#A197B4] mt-0.5 leading-relaxed">{ev.message}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
