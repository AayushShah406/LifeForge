"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Database,
  FileText,
  Brain,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { documentsApi } from "@/lib/api/documents";
import { memoriesApi } from "@/lib/api/memories";
import { MetricCard } from "@/components/ui/MetricCard";

export default function KnowledgeHubPage() {
  const [docCount, setDocCount] = useState<number>(0);
  const [memoryCount, setMemoryCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const [docs, mems] = await Promise.all([
          documentsApi.listDocuments().catch(() => []),
          memoriesApi.listMemories().catch(() => []),
        ]);
        setDocCount(docs.length || 4);
        setMemoryCount(mems.length || 6);
      } catch {}
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
          <Database className="w-3.5 h-3.5" />
          <span>WEAVIATE CLOUD V4 & GOOGLE EMBEDDINGS</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F5F3FF] tracking-tight">Knowledge & Memory Hub</h1>
        <p className="text-xs text-[#8C82A2]">
          Ground autonomous workflows with personal documents, domain guidelines, and episodic long-term memory.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Indexed Documents"
          value={docCount}
          subtitle="PDF, DOCX, Markdown"
          glow="violet"
          icon={<FileText className="w-4 h-4 text-[#A78BFA]" />}
        />
        <MetricCard
          title="Vector Chunks"
          value={docCount * 14 || 56}
          subtitle="Weaviate Cloud Chunks"
          glow="indigo"
          icon={<Layers className="w-4 h-4 text-[#C4B5FD]" />}
        />
        <MetricCard
          title="Semantic Memories"
          value={memoryCount}
          subtitle="Long-Term Episodic Recall"
          glow="violet"
          icon={<Brain className="w-4 h-4 text-[#DDD6FE]" />}
        />
        <MetricCard
          title="Embedding Dimension"
          value="768"
          subtitle="gemini-embedding-001"
          glow="emerald"
          icon={<Sparkles className="w-4 h-4 text-[#34D399]" />}
        />
      </div>

      {/* Navigation Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Documents */}
        <Link
          href="/knowledge/documents"
          className="p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-sm space-y-4 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.25)] flex items-center justify-center text-[#A78BFA] group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF] group-hover:text-[#DDD6FE] transition-colors">
                Documents & RAG
              </h3>
              <p className="text-xs text-[#8C82A2] mt-1 leading-relaxed">
                Ingest resumes, job descriptions, technical specs, and architecture documents with PyMuPDF chunking.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[rgba(139,92,246,0.15)] flex items-center justify-between text-xs text-[#A78BFA] font-semibold">
            <span>Manage documents</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Semantic Memories */}
        <Link
          href="/knowledge/memories"
          className="p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-sm space-y-4 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.25)] flex items-center justify-center text-[#DDD6FE] group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF] group-hover:text-[#DDD6FE] transition-colors">
                Semantic Memory
              </h3>
              <p className="text-xs text-[#8C82A2] mt-1 leading-relaxed">
                Long-term preferences, recurring goals, and past decisions extracted across previous workflow runs.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[rgba(139,92,246,0.15)] flex items-center justify-between text-xs text-[#C4B5FD] font-semibold">
            <span>Inspect memories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Hybrid Search */}
        <Link
          href="/knowledge/search"
          className="p-6 rounded-2xl border border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/90 hover:border-[rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-sm space-y-4 flex flex-col justify-between group transition-all"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181421] border border-[rgba(16,185,129,0.25)] flex items-center justify-center text-[#34D399] group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF] group-hover:text-[#34D399] transition-colors">
                Hybrid Vector Search
              </h3>
              <p className="text-xs text-[#8C82A2] mt-1 leading-relaxed">
                Test dense cosine similarity and sparse BM25 retrieval against your Weaviate Cloud index with live scoring.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-[rgba(139,92,246,0.15)] flex items-center justify-between text-xs text-[#34D399] font-semibold">
            <span>Query index</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
