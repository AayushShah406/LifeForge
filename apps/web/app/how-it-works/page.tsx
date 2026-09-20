"use client";

import Link from "next/link";
import {
  GitBranch,
  ShieldCheck,
  Cpu,
  Brain,
  Database,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Search,
  Wrench,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Execution Engine Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          How LifeForge Orchestrates Verified Actions
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Behind every high-level goal is a deterministic LangGraph state machine powered by Gemini 3 models, Weaviate hybrid memory, and human-in-the-loop safety checkpoints.
        </p>
      </div>

      {/* Interactive Visual Graph Architecture Diagram */}
      <section id="architecture" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Topology Diagram
          </h2>
          <h3 className="text-2xl font-bold text-white">LangGraph Multi-Agent Execution State Machine</h3>
        </div>

        <div className="p-8 rounded-3xl border border-cyan-500/30 bg-[#0B111D] shadow-2xl shadow-cyan-500/5 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* SVG Graph Visualization */}
          <div className="w-full max-w-4xl mx-auto overflow-x-auto py-6">
            <div className="min-w-[700px] flex flex-col items-center space-y-8">
              {/* Stage 1: Input */}
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono flex items-center gap-2 shadow-lg">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>User High-Level Goal</span>
                </div>
                <div className="w-8 h-[2px] bg-cyan-500/50" />
                <div className="px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Gemini 3.1 Pro Planner</span>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-[2px] h-8 bg-cyan-500/50" />

              {/* Stage 2: Parallel Agents */}
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-2">
                  <div className="text-indigo-400 text-xs font-bold font-mono">Researcher Agent</div>
                  <p className="text-[11px] text-slate-400">
                    Weaviate Hybrid RAG & Google Embeddings
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-2">
                  <div className="text-purple-400 text-xs font-bold font-mono">Tool Executor</div>
                  <p className="text-[11px] text-slate-400">
                    Gemini 3.8 Flash + MCP Protocol Tools
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                  <div className="text-emerald-400 text-xs font-bold font-mono">Verification Agent</div>
                  <p className="text-[11px] text-slate-400">
                    Faithfulness & Policy Compliance Gate
                  </p>
                </div>
              </div>

              {/* Vertical connector */}
              <div className="w-[2px] h-8 bg-amber-500/50" />

              {/* Stage 3: Human Gate */}
              <div className="px-8 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold flex items-center gap-3 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Human-In-The-Loop Approval Gate (State Interrupted)</span>
              </div>

              {/* Vertical connector */}
              <div className="w-[2px] h-8 bg-emerald-500/50" />

              {/* Stage 4: Verified Result */}
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Action Execution & Final Result</span>
                </div>
                <div className="w-8 h-[2px] bg-slate-700" />
                <div className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LangSmith Tracing & Evaluation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Breakdown */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Lifecycle Breakdown
          </h2>
          <h3 className="text-2xl font-bold text-white">6 Deterministic Execution Phases</h3>
        </div>

        <div className="space-y-6">
          {/* 1 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-cyan-400 shrink-0">
              01
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Goal Understanding & Ambiguity Detection</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a user inputs a goal such as &quot;Prepare me for my interview next Thursday&quot;, Gemini 3.1 Pro inspects the prompt for missing parameters (company name, role level, interview format). If ambiguous, the agent state pauses and yields a clarifying question rather than making blind assumptions.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 pt-1">
                <span>Node: goal_decomposition</span>
                <span>•</span>
                <span>Model: gemini-3.1-pro-preview</span>
              </div>
            </div>
          </div>

          {/* 2 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-indigo-400 shrink-0">
              02
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Knowledge Synthesis & Semantic Memory Recall</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Researcher agent queries Weaviate Cloud v4 using hybrid vector search (powered by gemini-embedding-001) combined with sparse BM25 retrieval. It pulls past resume bullets, uploaded code repos, company briefing docs, and episodic memories from prior user workflows.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-400 pt-1">
                <span>Node: knowledge_retrieval</span>
                <span>•</span>
                <span>Vector: Weaviate Hybrid Cloud</span>
              </div>
            </div>
          </div>

          {/* 3 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-mono font-bold text-purple-400 shrink-0">
              03
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Model Context Protocol (MCP) Tool Execution</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gemini 3.8 Flash executes tools conforming to the open Model Context Protocol. Tools include filesystem operations, search scrapers, PostgreSQL querying, and external APIs. Each tool output is stored in the LangGraph state checkpoint with latency and token telemetry.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-purple-400 pt-1">
                <span>Node: tool_execution</span>
                <span>•</span>
                <span>Protocol: Model Context Protocol (MCP)</span>
              </div>
            </div>
          </div>

          {/* 4 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono font-bold text-amber-400 shrink-0">
              04
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Automated Verification & Safety Policy Check</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before any action completes, the Verification Agent evaluates the candidate output against two criteria: factual grounding (faithfulness to retrieved documents) and risk level. Sensitive actions (such as sending emails, deleting data, or making external mutations) are flagged for human sign-off.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 pt-1">
                <span>Node: verification_gate</span>
                <span>•</span>
                <span>Risk Classifier: Low / Medium / High</span>
              </div>
            </div>
          </div>

          {/* 5 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-mono font-bold text-teal-400 shrink-0">
              05
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Human-In-The-Loop Approval & Action Dispatch</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an action requires review, the workflow interrupts and creates an interactive approval task. The user can inspect the exact payload, modify parameters, approve, or reject. Upon approval, execution resumes seamlessly from the saved checkpoint.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-teal-400 pt-1">
                <span>Node: human_approval</span>
                <span>•</span>
                <span>Checkpointer: PostgreSQL Async Checkpointer</span>
              </div>
            </div>
          </div>

          {/* 6 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-emerald-400 shrink-0">
              06
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="text-base font-bold text-white">Structured Output & Trajectory Evaluation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The final result is synthesized into a typed Pydantic output, creating tracked action tasks, updating episodic memory vectors, and streaming the complete agent trajectory to the user and LangSmith for ongoing quality evaluation.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 pt-1">
                <span>Node: output_synthesis</span>
                <span>•</span>
                <span>Observability: LangSmith Trace Lineage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <div className="text-center space-y-4">
        <Link
          href="/command-center"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all"
        >
          <span>Try a live workflow in Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
