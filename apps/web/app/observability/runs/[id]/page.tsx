"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Clock,
  ChevronLeft,
  ChevronRight,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { observabilityApi } from "@/lib/api/observability";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/EmptyState";

interface TraceNode {
  id: string;
  name: string;
  type: "chain" | "llm" | "tool";
  model?: string;
  duration_ms: number;
  tokens?: number;
  cost?: number;
  input?: any;
  output?: any;
  children?: TraceNode[];
}

export default function RunTraceDetailPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [traceTree, setTraceTree] = useState<TraceNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);

  useEffect(() => {
    async function loadTrace() {
      try {
        const data = await observabilityApi.getRunTrace(id);
        if (data && data.tree) {
          setTraceTree(data.tree);
          setSelectedNode(data.tree);
        } else {
          // Robust mock run tree
          const mockTree: TraceNode = {
            id: `root_${id}`,
            name: "LangGraph Root Workflow",
            type: "chain",
            duration_ms: 1240,
            tokens: 3840,
            cost: 0.0042,
            input: { goal: "Prepare me for my interview next Thursday at Google" },
            output: { status: "success", questions_generated: 4, tasks_created: 3 },
            children: [
              {
                id: "step_planner",
                name: "supervisor_planning_node",
                type: "llm",
                model: "gemini-3.1-pro-preview",
                duration_ms: 410,
                tokens: 1450,
                cost: 0.0028,
                input: {
                  system: "Decompose user goals into deterministic execution DAG.",
                  prompt: "Prepare me for my interview next Thursday at Google for Senior AI Systems Engineer.",
                },
                output: {
                  steps: ["research_company", "analyze_resume", "generate_questions", "create_study_plan"],
                  ambiguity_detected: false,
                },
                children: [
                  {
                    id: "tool_ambiguity",
                    name: "ambiguity_checker",
                    type: "tool",
                    duration_ms: 45,
                    input: { query: "Prepare me for my interview next Thursday" },
                    output: { is_ambiguous: false, confidence: 0.96 },
                  },
                ],
              },
              {
                id: "step_researcher",
                name: "research_retrieval_node",
                type: "llm",
                model: "gemini-3.8-flash",
                duration_ms: 510,
                tokens: 1820,
                cost: 0.00032,
                input: {
                  context_source: "Weaviate Hybrid Cloud v4",
                  query: "Google AI Systems Engineer interview topics",
                },
                output: {
                  matches: ["Distributed inference", "LangGraph checkpoints", "Weaviate RAG architecture"],
                },
                children: [
                  {
                    id: "tool_weaviate",
                    name: "weaviate_hybrid_search",
                    type: "tool",
                    duration_ms: 140,
                    input: { query: "AI systems engineer resume", top_k: 4 },
                    output: { chunks_retrieved: 4, average_score: 0.932 },
                  },
                  {
                    id: "tool_search",
                    name: "web_search",
                    type: "tool",
                    duration_ms: 220,
                    input: { query: "Google Cloud Gemini 3 architecture whitepaper" },
                    output: { results_count: 5, status: "200_ok" },
                  },
                ],
              },
              {
                id: "step_verifier",
                name: "verification_safety_node",
                type: "llm",
                model: "gemini-3.1-pro-preview",
                duration_ms: 320,
                tokens: 570,
                cost: 0.0011,
                input: {
                  verification_criteria: ["faithfulness", "grounding", "safety_policy"],
                },
                output: {
                  grounding_score: 0.96,
                  hallucination_detected: false,
                  action_risk: "low",
                  verification_status: "approved",
                },
              },
            ],
          };
          setTraceTree(mockTree);
          setSelectedNode(mockTree);
        }
      } finally {
        setLoading(false);
      }
    }
    loadTrace();
  }, [id]);

  if (loading || !traceTree) {
    return <LoadingState message="Loading hierarchical run tree..." />;
  }

  const renderTreeNode = (node: TraceNode, depth = 0) => {
    const isSelected = selectedNode?.id === node.id;
    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => setSelectedNode(node)}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          className={`py-2 pr-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors text-xs font-mono ${
            isSelected
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {node.type === "chain" && <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
            {node.type === "llm" && <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            {node.type === "tool" && <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            <span className="truncate">{node.name}</span>
          </div>
          <span className="text-[10px] text-slate-500 shrink-0 pl-2">{node.duration_ms}ms</span>
        </div>

        {node.children && (
          <div className="space-y-1">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/observability/runs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to All Traces</span>
        </Link>
      </div>

      {/* Header */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              TRACE #{String(id).slice(0, 10).toUpperCase()}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LangSmith Tree Lineage
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {traceTree.name}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Captured {new Date().toLocaleDateString()} with sub-second node attribution.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/10 text-center min-w-[80px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Duration</span>
            <div className="text-xs font-mono font-bold text-cyan-400">{traceTree.duration_ms}ms</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/10 text-center min-w-[80px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Tokens</span>
            <div className="text-xs font-mono font-bold text-indigo-400">{traceTree.tokens}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#070A12] border border-white/10 text-center min-w-[80px]">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Est Cost</span>
            <div className="text-xs font-mono font-bold text-emerald-400">${(traceTree.cost || 0).toFixed(5)}</div>
          </div>
        </div>
      </div>

      {/* Main Split: Tree Explorer (Left) & Node Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hierarchical Run Tree */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
              Execution Tree
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Interactive</span>
          </div>

          <div className="space-y-1">{renderTreeNode(traceTree)}</div>
        </div>

        {/* Right Column: Node Details Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {selectedNode ? (
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                    <span className="text-cyan-400 uppercase">{selectedNode.type}</span>
                    {selectedNode.model && <span>• {selectedNode.model}</span>}
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="text-cyan-400 font-bold">{selectedNode.duration_ms}ms</div>
                  {selectedNode.tokens && (
                    <div className="text-slate-500">{selectedNode.tokens} tokens</div>
                  )}
                </div>
              </div>

              {/* Node Input */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400">Node Input Payload</span>
                <pre className="p-3.5 rounded-xl bg-[#06080E] border border-white/[0.06] text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedNode.input || {}, null, 2)}
                </pre>
              </div>

              {/* Node Output */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400">Node Output Payload</span>
                <pre className="p-3.5 rounded-xl bg-[#06080E] border border-white/[0.06] text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedNode.output || {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a node in the execution tree to inspect state payloads and latencies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
