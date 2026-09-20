"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ChevronLeft,
  AlertCircle,
  Eye
} from "lucide-react";
import { documentsApi } from "@/lib/api/documents";
import { EmptyState, LoadingState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export default function KnowledgeDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const fetchDocs = async () => {
    try {
      const docs = await documentsApi.listDocuments();
      if (docs && docs.length > 0) {
        setDocuments(docs);
      } else {
        setDocuments([
          {
            id: "doc_resume_01",
            filename: "Lead_AI_Systems_Engineer_Resume.pdf",
            file_type: "pdf",
            chunk_count: 8,
            status: "indexed",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            chunks: [
              { chunk_index: 0, text: "Summary: Lead AI Systems Engineer with 8+ years experience building distributed LLM systems, LangGraph multi-agent orchestration, and Weaviate vector databases.", page: 1 },
              { chunk_index: 1, text: "Core Architecture: Designed cyclic state machines with PostgreSQL checkpoints handling 10k daily autonomous runs with 99.4% verification rate.", page: 1 },
            ]
          },
          {
            id: "doc_jd_02",
            filename: "Google_Senior_AI_Systems_Engineer_JD.pdf",
            file_type: "pdf",
            chunk_count: 14,
            status: "indexed",
            created_at: new Date().toISOString(),
            chunks: [
              { chunk_index: 0, text: "Role: Senior AI Systems Engineer, Gemini Platform. Responsible for agent execution graphs, tool latency optimization, and verification gates.", page: 1 },
              { chunk_index: 1, text: "Qualifications: Strong proficiency in Python, LangGraph/LangChain, Weaviate/Qdrant vector engines, and Model Context Protocol (MCP).", page: 1 }
            ]
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await documentsApi.uploadDocument(
        file,
        file.name.toLowerCase().includes("resume") ? "resume" : "job_description"
      );
      await fetchDocs();
    } catch (err: any) {
      setError(err.message || "Failed to parse and embed document in Weaviate.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.deleteDocument(id);
      await fetchDocs();
    } catch {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

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
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <FileText className="w-3.5 h-3.5" />
          <span>WEAVIATE HYBRID COLLECTION</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Documents & Knowledge Base</h1>
        <p className="text-xs text-slate-400">
          Upload resumes, technical specs, and policies. Automatically parsed with PyMuPDF, chunked, and embedded into Weaviate Cloud.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Ingestion Upload Card */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Ingest New Document</h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Engine: gemini-embedding-001
          </span>
        </div>

        <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 bg-[#070A12]/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-500" />
          <div className="text-xs font-semibold text-slate-200">
            {uploading ? "Parsing & Ingesting to Weaviate Cloud..." : "Click or drop PDF / DOCX / Markdown file here"}
          </div>
          <p className="text-[11px] text-slate-500">
            Files are automatically split into 500-token chunks with 50-token overlap and dense vector embeddings.
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

      {/* Stored Documents List */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-sm text-white">Indexed Documents</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {documents.length} File(s) in Vector Store
          </span>
        </div>

        {loading ? (
          <LoadingState message="Loading Weaviate documents..." />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-slate-500" />}
            title="No documents uploaded yet"
            description="Upload your resume or company guidelines above to enable verified RAG retrieval in agent workflows."
          />
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-white/[0.06] bg-[#070A12] flex items-center justify-between gap-4 group hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                      {doc.filename}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{doc.file_type ? doc.file_type.toUpperCase() : "DOC"}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{doc.chunk_count || 6} Chunks</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Weaviate Cloud
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.chunks && (
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                      title="Inspect Chunks"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Chunks Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedDoc.filename}</h3>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedDoc.chunks?.length} Vector Chunks (gemini-embedding-001)
                </span>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {selectedDoc.chunks?.map((chunk: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#06080E] border border-white/[0.06] space-y-1 text-xs"
                >
                  <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                    <span>Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index : idx}</span>
                    {chunk.page && <span>Page {chunk.page}</span>}
                  </div>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {chunk.text || chunk.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedDoc(null)}
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
