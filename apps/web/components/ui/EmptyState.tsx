import React from "react";
import { LucideIcon, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/50 backdrop-blur-sm">
      <div className="p-4 rounded-2xl bg-[#12101A] border border-[rgba(139,92,246,0.25)] text-[#A78BFA] mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.15)]">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          (() => {
            const IconComponent = (icon as LucideIcon) || Inbox;
            return <IconComponent className="w-8 h-8 text-[#A78BFA]" />;
          })()
        )}
      </div>
      <h3 className="text-base font-bold text-[#F5F3FF] mb-1">{title}</h3>
      <p className="text-xs text-[#8C82A2] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ message = "Loading agent operations..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(139,92,246,0.15)] border-t-[#8B5CF6] animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-ping"></div>
      </div>
      <p className="text-xs font-mono text-[#DDD6FE] animate-pulse">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Failed to load state",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)]">
      <AlertCircle className="w-8 h-8 text-[#F87171] mb-3" />
      <h3 className="text-sm font-bold text-[#F5F3FF] mb-1">{title}</h3>
      <p className="text-xs text-[#FCA5A5] max-w-md mb-4">{message || "An unexpected error occurred while communicating with the LifeForge backend."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
