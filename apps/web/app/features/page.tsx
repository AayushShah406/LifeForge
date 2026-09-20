"use client";

import Link from "next/link";
import {
  Cpu,
  GitBranch,
  Database,
  ShieldCheck,
  Wrench,
  Activity,
  Layers,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const FEATURE_SECTIONS = [
  {
    category: "Intelligent Reasoning & Routing",
    title: "Tri-Tier Gemini 3 Orchestration",
    description:
      "LifeForge dynamically routes prompts based on cognitive complexity, token budget, and latency requirements across the Gemini 3 family.",
    points: [
      "Gemini 3.1 Pro: Long-horizon planning, multi-source synthesis, and edge-case detection",
      "Gemini 3.8 Flash: High-speed parallel tool dispatch and real-time execution loops",
      "Gemini 3.1 Flash-Lite: Low-overhead document metadata extraction and semantic tagging",
      "Dynamic cost-and-latency optimizer with graceful fallback",
    ],
    icon: Cpu,
    tag: "Gemini 3.1 Pro / 3.8 Flash",
  },
  {
    category: "Agent State & Resilience",
    title: "LangGraph Stateful Checkpointing",
    description:
      "Unlike fragile linear chains, LifeForge manages execution using cyclic state machines backed by persistent PostgreSQL checkpoints.",
    points: [
      "Deterministic state serialization after every agent thought and tool result",
      "Time-travel debugging and workflow rewind capability",
      "Sub-agent spawning with isolated memory boundaries",
      "Dynamic re-planning when external tool APIs return errors",
    ],
    icon: GitBranch,
    tag: "LangGraph Engine",
  },
  {
    category: "Retrieval & Grounding",
    title: "Weaviate Cloud Hybrid RAG & Memory",
    description:
      "Combines vector embeddings with BM25 keyword matching and episodic memory recall for grounded answers with zero hallucinations.",
    points: [
      "Hybrid vector + sparse BM25 search powered by gemini-embedding-001",
      "Automatic chunking, metadata extraction, and indexing of PDF, Word, and text",
      "Episodic memory store preserving past user preferences and decisions",
      "Cross-collection reciprocal rank fusion (RRF) reranking",
    ],
    icon: Database,
    tag: "Weaviate Cloud v4",
  },
  {
    category: "Safety & Governance",
    title: "Dual-Layer Verification & HITL Approval",
    description:
      "No autonomous action is permitted to make external modifications without passing automated verification and required human review.",
    points: [
      "Automated verification agent checks outputs against grounding documents",
      "Configurable risk classification (Low, Medium, High Risk)",
      "Interactive human-in-the-loop approval cards with diff previews",
      "Cryptographic audit trail of all approved and rejected operations",
    ],
    icon: ShieldCheck,
    tag: "Human-in-the-Loop",
  },
  {
    category: "Extensibility & Ecosystem",
    title: "Model Context Protocol (MCP) Tools",
    description:
      "Universal tool connectivity standard that allows your agents to interact with local services, cloud APIs, and internal microservices.",
    points: [
      "Native support for stdio and SSE transport protocols",
      "Pre-integrated tools: Filesystem, HTTP, Shell, SQLite, and Web Search",
      "Dynamic runtime tool discovery and JSONSchema validation",
      "Isolated sandboxing prevents unintended system changes",
    ],
    icon: Wrench,
    tag: "MCP Native",
  },
  {
    category: "Production Reliability",
    title: "Deep Observability & LLM Evaluation",
    description:
      "Complete transparency into token consumption, latency breakdown, tool payloads, and automated semantic evaluation scores.",
    points: [
      "Hierarchical run tree visualization for LangGraph nodes and tools",
      "Cost and token attribution broken down by Gemini model",
      "Automated evaluation suites testing faithfulness, relevance, and safety",
      "LangSmith integration for production tracing and dataset curation",
    ],
    icon: Activity,
    tag: "LangSmith & OpenTelemetry",
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Platform Features</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Enterprise AI Engineering, Built for Reliable Execution
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Every layer of LifeForge is built to provide deterministic results, complete auditability, and production-grade agentic performance.
        </p>
      </div>

      {/* Feature Deep-Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {FEATURE_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="p-8 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-sm space-y-6 flex flex-col justify-between hover:border-cyan-500/30 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300">
                    {sec.tag}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                    {sec.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{sec.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{sec.description}</p>
                <ul className="space-y-2 pt-2">
                  {sec.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Explore in workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Experience verified AI agent execution
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Start deploying multi-agent workflows with human-in-the-loop guarantees in minutes.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
