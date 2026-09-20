"use client";

import { useState } from "react";
import {
  Users,
  Cpu,
  Brain,
  ShieldCheck,
  Wrench,
  Sparkles,
  GitBranch,
  Terminal,
  Database,
  Code,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2
} from "lucide-react";

interface AgentDef {
  id: string;
  name: string;
  role: string;
  model: string;
  category: string;
  tools: string[];
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  description: string;
  status: "active" | "idle" | "ready";
}

const AGENTS: AgentDef[] = [
  {
    id: "agent_planner",
    name: "Planner Supervisor",
    role: "Goal Decomposition & Workflow Sequencing",
    model: "gemini-3.1-pro-preview",
    category: "Reasoning Tier",
    tools: ["goal_decomposition", "dependency_resolver", "ambiguity_checker"],
    maxTokens: 4096,
    temperature: 0.2,
    description:
      "Analyzes user objectives, identifies missing constraints, generates topological task DAGs, and supervises sub-agent transitions in LangGraph.",
    systemPrompt:
      "You are the LifeForge Planning Supervisor. Your mission is to decompose high-level user goals into structured, executable steps. If crucial parameters are missing, formulate clarifying questions rather than hallucinating assumptions. Maintain state deterministic checkpoints.",
    status: "active",
  },
  {
    id: "agent_researcher",
    name: "Researcher & RAG Specialist",
    role: "Knowledge Synthesis & Document Grounding",
    model: "gemini-3.8-flash",
    category: "Fast Ops Tier",
    tools: ["weaviate_hybrid_search", "web_search", "document_chunk_extractor", "memory_recall"],
    maxTokens: 3072,
    temperature: 0.1,
    description:
      "Performs hybrid sparse/dense vector queries in Weaviate Cloud v4, retrieves relevant resume items and project documentation, and synthesizes external facts.",
    systemPrompt:
      "You are the LifeForge Research Agent. Ground all claims in retrieved primary sources from Weaviate vector collections or authorized web search APIs. Do not fabricate citations.",
    status: "active",
  },
  {
    id: "agent_executor",
    name: "MCP Tool Executor",
    role: "Action Execution & Sandboxed Operations",
    model: "gemini-3.8-flash",
    category: "Execution Tier",
    tools: ["mcp_filesystem", "mcp_terminal_sandbox", "mcp_postgres_query", "calendar_schedule"],
    maxTokens: 2048,
    temperature: 0.0,
    description:
      "Executes tools conforming to the Model Context Protocol (MCP). Handles filesystem modifications, sandboxed command verification, and API calls.",
    systemPrompt:
      "You are the LifeForge Tool Executor. Execute requested tool functions with strictly validated JSON arguments. Report exact return payloads, status codes, and execution latencies.",
    status: "ready",
  },
  {
    id: "agent_verifier",
    name: "Verification & Safety Agent",
    role: "Dual-Layer Grounding & Policy Evaluation",
    model: "gemini-3.1-pro-preview",
    category: "Safety Gate Tier",
    tools: ["faithfulness_evaluator", "hallucination_detector", "risk_classifier", "human_gate_trigger"],
    maxTokens: 2048,
    temperature: 0.0,
    description:
      "Inspects intermediate and final outputs against 7 evaluation criteria. Classifies operational risk and interrupts workflow state for human sign-off.",
    systemPrompt:
      "You are the LifeForge Verification Agent. Evaluate every proposed action for factual alignment with context documents. Trigger human approval whenever an action introduces external state mutations.",
    status: "active",
  },
  {
    id: "agent_domain",
    name: "Interview & Career Specialist",
    role: "Domain-Specific Formulation & Coaching",
    model: "gemini-3.8-flash",
    category: "Specialist Tier",
    tools: ["question_generator", "star_rubric_evaluator", "tech_stack_analyzer"],
    maxTokens: 2048,
    temperature: 0.4,
    description:
      "Generates technical system design questions, STAR behavioral prompts, and candidate briefing dossiers matched to target company engineering bars.",
    systemPrompt:
      "You are the LifeForge Interview Specialist. Generate rigorous, realistic engineering interview questions. Provide probing questions and model answer rubrics.",
    status: "idle",
  },
  {
    id: "agent_synthesizer",
    name: "Output Synthesizer & Task Generator",
    role: "Structured Artifact Creation & State Finalization",
    model: "gemini-3.1-flash-lite",
    category: "Lightweight Tier",
    tools: ["markdown_formatter", "action_task_persister", "memory_vector_indexer"],
    maxTokens: 2048,
    temperature: 0.2,
    description:
      "Synthesizes final response briefings into formatted markdown, persists deterministic action tasks in PostgreSQL, and indexes learnings into episodic memory.",
    systemPrompt:
      "You are the LifeForge Synthesizer. Package final workflow results into clean, actionable structures. Extract next action tasks and emit structured Pydantic representations.",
    status: "ready",
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentDef | null>(null);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            <span>LANGGRAPH MULTI-AGENT SWARM</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Agent Registry</h1>
          <p className="text-xs text-slate-400">
            Specialized Gemini 3-powered autonomous agents collaborating via stateful LangGraph channels.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>6 Agents Configured</span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-sm space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {agent.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agent.status === "active"
                        ? "bg-emerald-400 animate-pulse"
                        : agent.status === "ready"
                        ? "bg-cyan-400"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="text-[11px] font-mono text-slate-400 capitalize">
                    {agent.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium">{agent.role}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{agent.description}</p>

              {/* Model & Tools */}
              <div className="pt-2 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Engine:</span>
                  <span className="text-cyan-400 font-bold">{agent.model}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Context / Tokens:</span>
                  <span className="text-indigo-400">{agent.maxTokens} tokens</span>
                </div>
              </div>

              {/* Tools Badges */}
              <div className="pt-1 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Connected Tools:</span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070A12] text-slate-400 border border-white/[0.06]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedAgent(agent)}
                className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect Prompt & Config</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt Inspector Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-white">{selectedAgent.name} Config</h2>
                <span className="text-xs font-mono text-cyan-400">{selectedAgent.model}</span>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">System Instruction Prompt</span>
                <div className="mt-1 p-3.5 rounded-xl bg-[#06080E] border border-white/[0.06] text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {selectedAgent.systemPrompt}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400">Temperature</span>
                  <div className="text-sm font-bold text-white font-mono">{selectedAgent.temperature}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400">Max Budget</span>
                  <div className="text-sm font-bold text-white font-mono">{selectedAgent.maxTokens}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400">State Checkpointing</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">Enabled</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs text-slate-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
