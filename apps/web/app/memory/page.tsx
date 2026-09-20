"use client";

import { useEffect, useState } from "react";
import { Brain, Plus, Search, Trash2, Sparkles, Shield, Bookmark } from "lucide-react";
import { listMemories } from "@/lib/api";

export default function MemoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("preference");
  const [importance, setImportance] = useState(0.8);
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    try {
      const data = await listMemories();
      if (data && data.length > 0) {
        setMemories(data);
      } else {
        // Demonstration pre-loaded memories
        setMemories([
          {
            id: "mem_1",
            content: "Candidate specializes in LangGraph cyclic state machine architectures and enterprise RAG pipelines.",
            memory_type: "fact",
            importance: 0.95,
            confidence: 0.98,
            source: "workflow_extraction",
          },
          {
            id: "mem_2",
            content: "Prefers morning interview preparation slots between 9:00 AM and 11:00 AM PST.",
            memory_type: "preference",
            importance: 0.85,
            confidence: 0.92,
            source: "user_direct",
          },
          {
            id: "mem_3",
            content: "Targeting Staff AI Systems Engineer or Lead Agent Architect roles at Tier 1 AI labs.",
            memory_type: "recurring_goal",
            importance: 0.90,
            confidence: 0.95,
            source: "workflow_extraction",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async () => {
    if (!newContent.trim()) return;
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          memory_type: newType,
          importance: parseFloat(importance.toString()),
        }),
      });
      if (res.ok) {
        setNewContent("");
        await fetchMemories();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Semantic Personal Memory</h1>
        <p className="text-xs text-slate-400">
          Weaviate-backed long-term memory. Evaluated by Gemini 3.1 Flash-Lite for relevance before pre-workflow retrieval.
        </p>
      </div>

      {/* Add Memory Card */}
      <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm text-white">Record Long-Term Fact or Preference</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="e.g. Focus interview prep on distributed LLM inference latency bottlenecks..."
            className="md:col-span-7 text-sm bg-surface-100 border border-surface-border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="md:col-span-3 text-sm bg-surface-100 border border-surface-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="preference">Preference</option>
            <option value="fact">Key Fact</option>
            <option value="recurring_goal">Recurring Goal</option>
            <option value="decision">Past Decision</option>
          </select>

          <button
            onClick={handleAddMemory}
            disabled={!newContent.trim()}
            className="md:col-span-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Store Memory
          </button>
        </div>
      </div>

      {/* Memories List */}
      <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-sm text-white">Active Semantic Memories</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {memories.length} Memories Stored in Weaviate
          </span>
        </div>

        <div className="space-y-3">
          {memories.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-surface-100 border border-surface-border hover:border-purple-500/40 transition-colors flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {m.memory_type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Importance: {Math.round(m.importance * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{m.content}</p>
              </div>

              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                Source: {m.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
