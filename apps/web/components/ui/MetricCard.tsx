import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  glow?: "violet" | "cyan" | "indigo" | "emerald" | "amber";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp = true,
  glow = "violet",
  className,
}: MetricCardProps) {
  const iconColors = {
    violet: "text-[#A78BFA] bg-[rgba(139,92,246,0.16)] border-[rgba(139,92,246,0.35)] shadow-[0_0_12px_rgba(139,92,246,0.2)]",
    cyan: "text-[#A78BFA] bg-[rgba(139,92,246,0.16)] border-[rgba(139,92,246,0.35)] shadow-[0_0_12px_rgba(139,92,246,0.2)]",
    indigo: "text-[#C4B5FD] bg-[#6D28D9]/20 border-[#6D28D9]/35",
    emerald: "text-[#34D399] bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    amber: "text-[#FBBF24] bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.35)] shadow-[0_0_10px_rgba(245,158,11,0.15)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 backdrop-blur-md p-5 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#A197B4]">{title}</span>
        {icon && (
          <div className={cn("p-2 rounded-xl border flex items-center justify-center", iconColors[glow])}>
            {React.isValidElement(icon) ? (
              icon
            ) : (
              (() => {
                const IconComponent = icon as LucideIcon;
                return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
              })()
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-black tracking-tight text-[#F5F3FF] font-mono">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono font-medium px-2 py-0.5 rounded-full border",
              trendUp
                ? "bg-[rgba(16,185,129,0.12)] text-[#34D399] border-[rgba(16,185,129,0.3)]"
                : "bg-[rgba(239,68,68,0.12)] text-[#F87171] border-[rgba(239,68,68,0.3)]"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-[#8C82A2] mt-1 font-mono">{subtitle}</p>}
    </div>
  );
}
