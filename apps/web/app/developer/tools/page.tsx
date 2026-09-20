"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  ChevronLeft,
  Terminal,
  Copy,
  Check,
  Code
} from "lucide-react";
import { developerApi } from "@/lib/api/developer";
import { LoadingState } from "@/components/ui/EmptyState";

export default function DeveloperToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await developerApi.getTools();
        setTools(data);
      } catch {
        setTools([
          {
            name: "mcp_filesystem_read",
            type: "mcp",
            input_schema: {
              type: "object",
              properties: { path: { type: "string" } },
              required: ["path"],
            },
          },
          {
            name: "mcp_terminal_execute",
            type: "mcp",
            input_schema: {
              type: "object",
              properties: { command: { type: "string" }, timeout: { type: "integer" } },
              required: ["command"],
            },
          },
          {
            name: "weaviate_hybrid_search",
            type: "vector_rag",
            input_schema: {
              type: "object",
              properties: { query: { type: "string" }, top_k: { type: "integer" } },
              required: ["query"],
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(tools, null, 2));
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
          <Wrench className="w-3.5 h-3.5" />
          <span>REST ENDPOINTS: GET /api/developer/tools & POST /api/mcp/{`{tool_name}`}</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tool Schemas API</h1>
        <p className="text-xs text-slate-400">
          Query registered tool JSONSchemas and programmatically trigger tool invocations in the sandbox.
        </p>
      </div>

      {/* Endpoint Details Card */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              GET
            </span>
            <span className="text-white">/api/developer/tools</span>
          </div>

          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Schemas"}</span>
          </button>
        </div>

        {loading ? (
          <LoadingState message="Fetching tool schemas..." />
        ) : (
          <pre className="p-4 rounded-xl bg-[#06080E] border border-white/[0.06] text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-96">
            {JSON.stringify(tools, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
