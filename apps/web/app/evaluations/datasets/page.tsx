"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  ChevronLeft,
  Plus,
  Play,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
  Search
} from "lucide-react";

interface EvalTestCase {
  id: string;
  goal: string;
  expected_steps: string[];
  expected_tool: string;
  must_verify: boolean;
}

interface EvalDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  cases: EvalTestCase[];
}

const DATASETS: EvalDataset[] = [
  {
    id: "interview_prep_v1",
    name: "Interview Preparation Suite",
    description: "Evaluates career goal decomposition, resume RAG retrieval, and technical question formulation.",
    category: "Career Ops",
    cases: [
      {
        id: "case_ip_01",
        goal: "Prepare me for my interview next Thursday at Google for Senior AI Systems Engineer.",
        expected_steps: ["research_company", "analyze_resume", "generate_questions", "create_study_plan"],
        expected_tool: "weaviate_hybrid_search",
        must_verify: true,
      },
      {
        id: "case_ip_02",
        goal: "Synthesize STAR behavioral examples for dealing with hallucinating agent tool outputs.",
        expected_steps: ["retrieve_memories", "draft_star_stories", "verify_rubric"],
        expected_tool: "memory_recall",
        must_verify: true,
      },
    ],
  },
  {
    id: "aws_devops_audit_v1",
    name: "AWS Infrastructure Audit Suite",
    description: "Tests tool sandboxing, command argument verification, and HITL authorization triggers.",
    category: "DevOps",
    cases: [
      {
        id: "case_aws_01",
        goal: "Audit staging AWS infrastructure for unattached EBS volumes and create delete tasks.",
        expected_steps: ["describe_volumes", "filter_unattached", "create_approval_task"],
        expected_tool: "mcp_terminal_execute",
        must_verify: true,
      },
    ],
  },
  {
    id: "rag_grounding_eval",
    name: "Weaviate Hybrid Grounding Suite",
    description: "Measures cosine similarity accuracy and BM25 sparse recall across messy PDF technical specifications.",
    category: "RAG Quality",
    cases: [
      {
        id: "case_rag_01",
        goal: "What are the exact LangGraph checkpointer thread configurations required for Postgres?",
        expected_steps: ["weaviate_search", "synthesize_specs"],
        expected_tool: "weaviate_hybrid_search",
        must_verify: true,
      },
    ],
  },
];

export default function EvalDatasetsPage() {
  const [datasets] = useState<EvalDataset[]>(DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<EvalDataset>(DATASETS[0]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/evaluations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Evaluations</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Database className="w-3.5 h-3.5" />
            <span>GROUND TRUTH EVALUATION DATASETS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Test Datasets</h1>
          <p className="text-xs text-slate-400">
            Curated scenario suites with expected milestones and ground-truth tool payloads.
          </p>
        </div>

        <Link
          href="/evaluations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Suite Benchmark</span>
        </Link>
      </div>

      {/* Main Split: Datasets list & Case Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Datasets selector */}
        <div className="lg:col-span-5 space-y-3">
          {datasets.map((ds) => {
            const isSelected = selectedDataset.id === ds.id;
            return (
              <div
                key={ds.id}
                onClick={() => setSelectedDataset(ds)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? "border-cyan-500/50 bg-[#0E1626] shadow-lg shadow-cyan-500/5"
                    : "border-white/[0.08] bg-[#0C121E]/90 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{ds.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {ds.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ds.description}</p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  {ds.cases.length} Test Scenario(s)
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Dataset Cases Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedDataset.name}</h3>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedDataset.cases.length} Validated Test Cases
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Active Suite
              </span>
            </div>

            <div className="space-y-4">
              {selectedDataset.cases.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-white/[0.06] bg-[#070A12] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Test Case #{idx + 1} ({c.id})
                    </span>
                    {c.must_verify && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Verification Required
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Goal Input:</span>
                    <p className="text-xs font-semibold text-white">&quot;{c.goal}&quot;</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] space-y-2 text-[11px] font-mono">
                    <div className="text-slate-400">
                      Expected Tool: <span className="text-cyan-400 font-bold">{c.expected_tool}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Required Milestone Steps:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {c.expected_steps.map((st) => (
                          <span
                            key={st}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-indigo-300 border border-white/10"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
