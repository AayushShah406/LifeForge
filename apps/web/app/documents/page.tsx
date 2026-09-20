"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { listDocuments } from "@/lib/api";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    const docs = await listDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", file.name.toLowerCase().includes("resume") ? "resume" : "job_description");

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchDocs();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/documents/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, top_k: 4 }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Documents & Weaviate RAG</h1>
        <p className="text-xs text-slate-400">
          Upload resumes, job descriptions, and domain notes. PyMuPDF and python-docx chunk and embed into Weaviate Cloud.
        </p>
      </div>

      {/* Upload Zone & Vector Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Ingest Document</h2>
          </div>

          <label className="border-2 border-dashed border-surface-border hover:border-cyan-500/50 bg-surface-100/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-500" />
            <div className="text-sm font-semibold text-slate-300">
              {uploading ? "Parsing & Ingesting to Weaviate..." : "Click or drag PDF / DOCX file here"}
            </div>
            <p className="text-xs text-slate-500">
              Supported: PDF, DOCX, TXT, Markdown. Max 25MB.
            </p>
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
            />
          </label>
        </div>

        {/* Semantic Vector Search */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm text-white">Weaviate Semantic Search</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              User Isolated
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. LangGraph state machine experience..."
              className="flex-1 text-sm bg-surface-100 border border-surface-border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </div>

          {/* Search Results Preview */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No search results yet.</p>
            ) : (
              searchResults.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-surface-100 text-xs space-y-1 border border-surface-border">
                  <div className="flex justify-between font-mono text-[10px] text-cyan-400">
                    <span>{r.source} (p.{r.page_number})</span>
                    <span>Similarity: {r.score}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2">{r.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Documents Table */}
      <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Stored Documents & Chunks</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {documents.length} Document(s) in Weaviate
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No documents uploaded yet. Upload your Resume or Job Description above to enable RAG.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-200 border border-surface-border flex items-center justify-center text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{doc.filename}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Type: {doc.file_type.toUpperCase()}</span>
                      <span>&bull;</span>
                      <span className="text-cyan-400 font-mono">{doc.chunk_count} Chunks</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">Embedded in Weaviate</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-right">
                  <div>Status: {doc.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
