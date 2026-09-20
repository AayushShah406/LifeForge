import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 p-1 rounded-xl bg-surface-100 border border-surface-border", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              isActive
                ? "bg-surface-300 text-white shadow-sm border border-surface-border font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-200/50"
            )}
          >
            {Icon && <Icon className={cn("w-3.5 h-3.5", isActive ? "text-cyan-400" : "text-slate-400")} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                  isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-surface-200 text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
