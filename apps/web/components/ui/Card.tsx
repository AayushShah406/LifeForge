import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: "cyan" | "indigo" | "emerald" | "none";
}

export function Card({ className, hoverEffect = false, glow = "none", children, ...props }: CardProps) {
  const glowStyles = {
    none: "",
    cyan: "border-cyan-500/30 shadow-lg shadow-cyan-500/5",
    indigo: "border-indigo-500/30 shadow-lg shadow-indigo-500/5",
    emerald: "border-emerald-500/30 shadow-lg shadow-emerald-500/5",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-surface-border bg-surface-50 p-6",
        hoverEffect && "hover:border-cyan-500/40 hover:bg-surface-100 transition-all duration-200",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between pb-4 border-b border-surface-border/60", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-bold text-white tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
