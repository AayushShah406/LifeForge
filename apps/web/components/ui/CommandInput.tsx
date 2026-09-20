"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function CommandInput({
  onSubmit,
  loading = false,
  placeholder = "What goal do you want LifeForge to accomplish?",
  className,
}: {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmit(prompt.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative group", className)}>
      <div className="relative flex items-center rounded-2xl border border-surface-border bg-surface-100/90 shadow-2xl backdrop-blur-xl focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all p-2">
        <div className="pl-3 pr-2 text-cyan-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full bg-transparent py-3 px-2 text-sm text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center gap-2 pr-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={!prompt.trim()}
            className="rounded-xl px-4 py-2 font-semibold shadow-md"
          >
            <span>Run Workflow</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </form>
  );
}
