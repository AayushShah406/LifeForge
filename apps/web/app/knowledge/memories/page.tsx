"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Sparkles,
  Shield,
  Bookmark,
  ChevronLeft,
  Filter
} from "lucide-react";
import { memoriesApi } from "@/lib/api/memories";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";

export default function KnowledgeMemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("preference");
  const [importance, setImportance] = useState(0.85);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchMemories = async () => {
    try {
      const data = await memoriesApi.listMemories();
      if (data && data.length > 0) {
        setMemories(data);
      } else {
        setMemories([
          {
            id: "mem_1",
            content: "Candidate specializes in LangGraph cyclic state machine architectures and enterprise RAG pipelines.",
            memory_type: "fact",
            importance: 0.95,
            confidence: 0.98,
            source: "workflow_extraction",
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: "mem_2",
            content: "Prefers morning interview preparation slots between 9:00 AM and 11:00 AM PST.",
            memory_type: "preference",
            importance: 0.85,
            confidence: 0.92,
            source: "user_direct",
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "mem_3",
            content: "Targeting Staff AI Systems Engineer or Lead Agent Architect roles at Tier 1 AI research organizations.",
            memory_type: "recurring_goal",
            importance: 0.90,
            confidence: 0.95,
            source: "workflow_extraction",
            created_at: new Date().toISOString()
          },
          {
            id: "mem_4",
            content: "Strictly disallow autonomous execution of destructive SQL drop commands without human confirmation.",
            memory_type: "decision",
            importance: 1.0,
            confidence: 0.99,
            source: "user_direct",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await memoriesApi.createMemory({
        content: newContent.trim(),
        memory_type: newType,
        importance: parseFloat(importance.toString()),
      });
      setNewContent("");
      await fetchMemories();
    } catch {
      setMemories((prev) => [
        {
          id: `mem_${Date.now()}`,
          content: newContent.trim(),
          memory_type: newType,
          importance: parseFloat(importance.toString()),
          confidence: 0.95,
          source: "user_direct",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewContent("");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await memoriesApi.deleteMemory(id);
      await fetchMemories();
    } catch {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filtered = memories.filter(
    (m) => typeFilter === "all" || m.memory_type === typeFilter
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Knowledge Hub</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
          <Brain className="w-3.5 h-3.5" />
          <span>EPISODIC SEMANTIC MEMORY</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Semantic Memories</h1>
        <p className="text-xs text-slate-400">
          Persistent memories recalled by Gemini 3 before workflow generation to personalize planning and prevent repetitive inquiries.
        </p>
      </div>

      {/* Ingest Memory Card */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <h2 className="font-bold text-sm text-white">Record New Episodic Memory</h2>
        </div>

        <form onSubmit={handleAddMemory} className="space-y-3">
          <textarea
            rows={2}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="e.g., Focus career prep questions on high-concurrency LangGraph checkpoint recovery..."
            className="w-full bg-[#070A12] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none transition-colors"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="bg-[#070A12] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
              >
                <option value="preference">Preference</option>
                <option value="fact">Key Fact</option>
                <option value="recurring_goal">Recurring Goal</option>
                <option value="decision">Past Decision</option>
              </select>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-[11px]">Importance:</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={importance}
                  onChange={(e) => setImportance(parseFloat(e.target.value))}
                  className="w-20 accent-purple-500"
                />
                <span className="font-mono text-purple-400 text-[11px]">
                  {Math.round(importance * 100)}%
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newContent.trim()}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              Store Memory
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Memory List */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-sm text-white">Active Memories ({filtered.length})</h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["all", "preference", "fact", "recurring_goal", "decision"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors font-medium cursor-pointer ${
                  typeFilter === t
                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Fetching memories..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Brain className="w-8 h-8 text-slate-500" />}
            title="No memories recorded"
            description="Add user preferences or key constraints above to guide future agent workflows."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-white/[0.06] bg-[#070A12] flex items-start justify-between gap-4 group hover:border-purple-500/30 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {m.memory_type.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      Importance: {Math.round(m.importance * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Source: {m.source}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{m.content}</p>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
