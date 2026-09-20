"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Key,
  Copy,
  Check,
  Server,
  Cpu,
  Wrench,
  ExternalLink,
  ShieldCheck,
  Code,
  ArrowRight
} from "lucide-react";

export default function DeveloperPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "lf_live_9f82d17c91e041ab94ee";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEVELOPER PLATFORM & API</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Developer Center</h1>
          <p className="text-xs text-slate-400">
            Integrate LifeForge agent workflows into your applications via our typed REST and SSE APIs.
          </p>
        </div>

        <a
          href="http://localhost:8001/docs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
        >
          <span>OpenAPI Docs</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
        </a>
      </div>

      {/* API Key Box */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Live Workspace API Key</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#070A12] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-xs text-cyan-300 select-all">
            {apiKey}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Include this key as a Bearer token in the <code>Authorization: Bearer &lt;key&gt;</code> header for programmatic execution.
        </p>
      </div>

      {/* Quick Links to Sub-sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/developer/agents"
          className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 hover:border-cyan-500/40 transition-all space-y-3 group block"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Agent Registry API
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Query configured agents, models, and system prompts via REST.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold pt-1">
            <span>Explore API</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/developer/tools"
          className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 hover:border-indigo-500/40 transition-all space-y-3 group block"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Tool Schemas API
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspect JSONSchemas for registered MCP tools and invoke directly.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold pt-1">
            <span>Explore API</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/developer/models"
          className="p-5 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 hover:border-purple-500/40 transition-all space-y-3 group block"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Model Routing Matrix
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Check Gemini 3 model capabilities, context windows, and pricing.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold pt-1">
            <span>Explore API</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Code Sample */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            cURL Request Sample
          </span>
          <span className="text-[10px] font-mono text-cyan-400">POST /api/goals</span>
        </div>
        <pre className="p-4 rounded-xl bg-[#06080E] border border-white/[0.06] text-xs font-mono text-cyan-300/90 overflow-x-auto">
{`curl -X POST "http://localhost:8001/api/goals" \\
  -H "Authorization: Bearer lf_live_9f82d17c91e041ab94ee" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goal": "Prepare me for my interview next Thursday: research company, check resume, generate questions",
    "model": "gemini-3.1-pro-preview"
  }'`}
        </pre>
      </div>
    </div>
  );
}
