"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  ChevronLeft,
  Server,
  Copy,
  Check,
  Zap,
  Sparkles
} from "lucide-react";
import { developerApi } from "@/lib/api/developer";
import { LoadingState } from "@/components/ui/EmptyState";

export default function DeveloperModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await developerApi.getModels();
        setModels(data);
      } catch {
        setModels([
          {
            id: "gemini-3.1-pro-preview",
            name: "Gemini 3.1 Pro Preview",
            tier: "reasoning",
            context_window: 1048576,
            input_price_per_1m: 1.25,
            output_price_per_1m: 5.0,
            recommended_for: "Complex multi-step planning, long-horizon synthesis, and dual-layer verification",
          },
          {
            id: "gemini-3.8-flash",
            name: "Gemini 3.8 Flash",
            tier: "fast_ops",
            context_window: 1048576,
            input_price_per_1m: 0.1,
            output_price_per_1m: 0.4,
            recommended_for: "Sub-second tool dispatch, web search synthesis, and parallel sub-agent loops",
          },
          {
            id: "gemini-3.1-flash-lite",
            name: "Gemini 3.1 Flash-Lite",
            tier: "lightweight",
            context_window: 1048576,
            input_price_per_1m: 0.075,
            output_price_per_1m: 0.3,
            recommended_for: "Document metadata extraction, semantic categorization, and fast token tagging",
          },
          {
            id: "gemini-embedding-001",
            name: "Gemini Embedding 001",
            tier: "embeddings",
            dimensions: 768,
            input_price_per_1m: 0.025,
            recommended_for: "Weaviate Cloud hybrid vector indexing and dense cosine similarity retrieval",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(models, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/developer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Developer Center</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Server className="w-3.5 h-3.5" />
          <span>REST ENDPOINT: GET /api/developer/models</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Model Routing Matrix API</h1>
        <p className="text-xs text-slate-400">
          Inspect the active Gemini 3 model tiers, token pricing, context limits, and routing recommendations.
        </p>
      </div>

      {/* Endpoint Details Card */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              GET
            </span>
            <span className="text-white">/api/developer/models</span>
          </div>

          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Models"}</span>
          </button>
        </div>

        {loading ? (
          <LoadingState message="Fetching model routing data..." />
        ) : (
          <pre className="p-4 rounded-xl bg-[#06080E] border border-white/[0.06] text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-96">
            {JSON.stringify(models, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
