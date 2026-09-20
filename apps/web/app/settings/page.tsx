"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Cpu,
  Database,
  ShieldCheck,
  Key,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
  Server
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "models" | "memory" | "security">("profile");
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || "Lead AI Engineer");
  const [email, setEmail] = useState(user?.email || "engineer@lifeforge.ai");
  const [defaultModel, setDefaultModel] = useState("gemini-3.1-pro-preview");
  const [maxTokens, setMaxTokens] = useState("4096");
  const [weaviateCluster, setWeaviateCluster] = useState("weaviate.cloud:443");
  const [requireApprovalShell, setRequireApprovalShell] = useState(true);
  const [requireApprovalCalendar, setRequireApprovalCalendar] = useState(true);
  const [requireApprovalEmail, setRequireApprovalEmail] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Settings className="w-3.5 h-3.5" />
            <span>SYSTEM PREFERENCES & POLICIES</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workspace Settings</h1>
          <p className="text-xs text-slate-400">
            Configure agent routing parameters, Weaviate vector persistence, and HITL safety policies.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Account</span>
        </button>

        <button
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "models"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Gemini 3 Routing</span>
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "memory"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Weaviate & Memory</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "security"
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety & Approvals</span>
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-sm text-white">Operator Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-slate-300 font-medium">Organization Role</label>
              <input
                type="text"
                disabled
                value="Lead AI Platform Architect (Admin)"
                className="w-full bg-[#070A12]/50 border border-white/[0.06] rounded-xl px-3.5 py-2 text-xs text-slate-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === "models" && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-sm text-white">Model Routing Matrix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Default Planning Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (High Speed)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Max Token Budget Per Step</label>
                <input
                  type="text"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-cyan-300">Automated Cost Optimization</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                LifeForge automatically assigns tool calls and RAG context extraction to Gemini 3.8 Flash to maximize speed while preserving Gemini 3.1 Pro tokens for planning and verification.
              </p>
            </div>
          </div>
        )}

        {/* Memory Tab */}
        {activeTab === "memory" && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-sm text-white">Weaviate Cloud & Embeddings Persistence</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Weaviate Cluster Host</label>
                <input
                  type="text"
                  value={weaviateCluster}
                  onChange={(e) => setWeaviateCluster(e.target.value)}
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070A12] border border-white/[0.06] text-xs">
                  <span className="text-slate-400 text-[10px]">Embedding Model</span>
                  <div className="font-mono text-cyan-400 font-bold mt-0.5">gemini-embedding-001</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070A12] border border-white/[0.06] text-xs">
                  <span className="text-slate-400 text-[10px]">Vector Dimensions</span>
                  <div className="font-mono text-indigo-400 font-bold mt-0.5">768 Float32</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-sm text-white">Human-In-The-Loop Safety Gates</h3>
            <p className="text-xs text-slate-400">
              Select which agent actions must interrupt execution and require human sign-off:
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-[#070A12] cursor-pointer">
                <div className="text-xs">
                  <span className="font-bold text-white">Terminal & Shell Mutations</span>
                  <p className="text-[11px] text-slate-400">Commands that delete or alter local files</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireApprovalShell}
                  onChange={(e) => setRequireApprovalShell(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-[#070A12] cursor-pointer">
                <div className="text-xs">
                  <span className="font-bold text-white">Google Calendar Event Creation</span>
                  <p className="text-[11px] text-slate-400">Booking preparation sessions or rescheduling</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireApprovalCalendar}
                  onChange={(e) => setRequireApprovalCalendar(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] bg-[#070A12] cursor-pointer">
                <div className="text-xs">
                  <span className="font-bold text-white">Outbound Email Dispatch</span>
                  <p className="text-[11px] text-slate-400">Sending draft messages to recruiters or panel members</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireApprovalEmail}
                  onChange={(e) => setRequireApprovalEmail(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
