"use client";

import { useState } from "react";
import {
  Calendar,
  Mail,
  GitBranch,
  Terminal,
  Database,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Link2,
  Check
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  provider: string;
  icon: any;
  status: "connected" | "disconnected" | "sandboxed";
  guardrail: "always_approve" | "never_approve" | "risk_gated";
  description: string;
  capabilities: string[];
}

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "int_google_calendar",
    name: "Google Calendar",
    provider: "Google Workspace",
    icon: Calendar,
    status: "sandboxed",
    guardrail: "always_approve",
    description: "Allows Planning Agents to check availability and schedule study sessions and interviews.",
    capabilities: ["Read free/busy times", "Create calendar events", "Update scheduling reminders"],
  },
  {
    id: "int_gmail",
    name: "Gmail API",
    provider: "Google Workspace",
    icon: Mail,
    status: "sandboxed",
    guardrail: "always_approve",
    description: "Search recruiter correspondence, extract interview requirements, and generate draft replies.",
    capabilities: ["Read interview emails", "Draft candidate responses", "Extract attachment text"],
  },
  {
    id: "int_github",
    name: "GitHub API",
    provider: "GitHub",
    icon: GitBranch,
    status: "connected",
    guardrail: "risk_gated",
    description: "Inspect target company public repositories, analyze codebases, and create draft branches.",
    capabilities: ["Search repository code", "Inspect open issues & PRs", "Analyze commit velocity"],
  },
  {
    id: "int_terminal_sandbox",
    name: "Local Terminal Sandbox",
    provider: "LifeForge OS Core",
    icon: Terminal,
    status: "connected",
    guardrail: "always_approve",
    description: "Executes deterministic code verification and test runners inside isolated container boundaries.",
    capabilities: ["Run pytest test suites", "Execute npm run test", "Verify file syntax"],
  },
  {
    id: "int_postgres",
    name: "PostgreSQL Engine",
    provider: "PostgreSQL Database",
    icon: Database,
    status: "connected",
    guardrail: "risk_gated",
    description: "Stores persistent LangGraph state checkpoints, action task models, and audit lineage.",
    capabilities: ["Persist graph checkpoints", "Query task states", "Maintain audit history"],
  },
  {
    id: "int_slack",
    name: "Slack Webhook Notifications",
    provider: "Slack Technologies",
    icon: MessageSquare,
    status: "disconnected",
    guardrail: "never_approve",
    description: "Broadcasts workflow completion notifications and urgent HITL approval alerts to team channels.",
    capabilities: ["Post approval notices", "Stream completion summaries"],
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccessId, setTestSuccessId] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "connected" || item.status === "sandboxed" ? "disconnected" : "connected";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTestSuccessId(null);
    setTimeout(() => {
      setTestingId(null);
      setTestSuccessId(id);
      setTimeout(() => setTestSuccessId(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Link2 className="w-3.5 h-3.5" />
            <span>ECOSYSTEM & EXTERNAL SERVICES</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Connected Integrations</h1>
          <p className="text-xs text-slate-400">
            Configure external services used by LifeForge agents. All mutations adhere to human sign-off policies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>5 of 6 Active</span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isConnected = item.status === "connected" || item.status === "sandboxed";
          const isTesting = testingId === item.id;
          const testPassed = testSuccessId === item.id;

          return (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-sm space-y-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize flex items-center gap-1 ${
                      isConnected
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{item.name}</h3>
                  <span className="text-[11px] font-mono text-slate-500">{item.provider}</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{item.description}</p>
                </div>

                {/* Guardrail Policy */}
                <div className="p-3 rounded-xl bg-[#070A12] border border-white/[0.06] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {item.guardrail === "always_approve"
                        ? "Approval Gate: MANDATORY"
                        : item.guardrail === "risk_gated"
                        ? "Approval Gate: RISK ASSESSED"
                        : "Approval Gate: AUTONOMOUS"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {item.guardrail === "always_approve"
                      ? "State execution interrupts whenever this integration makes mutations."
                      : "Read-only actions execute automatically; mutations trigger review."}
                  </p>
                </div>

                {/* Capabilities */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Allowed Actions:</span>
                  <div className="space-y-0.5">
                    {item.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => handleTestConnection(item.id)}
                  disabled={!isConnected || isTesting}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : testPassed ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Online</span>
                    </>
                  ) : (
                    <span>Test Ping</span>
                  )}
                </button>

                <button
                  onClick={() => toggleConnection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isConnected
                      ? "text-slate-400 hover:text-rose-400"
                      : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {isConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
