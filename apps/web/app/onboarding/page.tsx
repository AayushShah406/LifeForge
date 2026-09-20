"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Shield,
  Cpu,
  Terminal,
  Code,
  Globe,
  Database,
  Sparkles,
  Layers,
  Wrench
} from "lucide-react";

const ROLES = [
  {
    id: "software_engineer",
    title: "Software Architect / Engineer",
    description: "Codebase audits, automated PR generation, tool-based debugging",
    icon: Code,
  },
  {
    id: "devops_engineer",
    title: "DevOps & Cloud Operator",
    description: "Cloud infra audits, CI/CD pipeline automation, incident response",
    icon: Terminal,
  },
  {
    id: "product_lead",
    title: "Product / Strategy Lead",
    description: "Competitive intelligence, user research synthesis, roadmapping",
    icon: Layers,
  },
  {
    id: "researcher",
    title: "AI Researcher / Analyst",
    description: "Deep literature synthesis, RAG benchmark evaluation, data pipelines",
    icon: Sparkles,
  },
];

const INITIAL_TOOLS = [
  { id: "mcp_filesystem", name: "Filesystem MCP", desc: "Read and write local workspace project files", checked: true },
  { id: "mcp_web_search", name: "Hybrid Web Search", desc: "Fetch real-time external documentation & APIs", checked: true },
  { id: "mcp_terminal", name: "Safe Terminal Sandbox", desc: "Execute sandboxed verification commands", checked: true },
  { id: "mcp_weaviate", name: "Weaviate Vector RAG", desc: "Index documents into hybrid semantic memory", checked: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("software_engineer");
  const [selectedTools, setSelectedTools] = useState<string[]>(["mcp_filesystem", "mcp_web_search", "mcp_terminal", "mcp_weaviate"]);
  const [goalPreference, setGoalPreference] = useState("Decompose architectural systems into autonomous verified workflows");
  const [submitting, setSubmitting] = useState(false);

  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/auth/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          role: selectedRole,
          focus_areas: [selectedRole],
          integrations: selectedTools,
          primary_goal: goalPreference,
        }),
      });

      // Also persist the first goal to the database if user provided one
      if (goalPreference && token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/goals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            raw_prompt: goalPreference,
            category: "general",
          }),
        }).catch(() => {});
      }
    } catch {
      // Continue regardless
    } finally {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8 py-8">
      {/* Brand & Stepper */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-xl text-[#F5F3FF]">LifeForge Onboarding</span>
        </div>
        <p className="text-xs text-[#8C82A2]">Configure your personal AI operations parameters</p>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  : s < step
                  ? "w-4 bg-[#6D28D9]"
                  : "w-4 bg-[#181421]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0C0A12]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.18)] space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Step 1: Select Your Role Persona</h2>
              <p className="text-xs text-[#8C82A2] mt-0.5">
                LifeForge calibrates default planning depth and tool prompts based on your workflow needs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#8B5CF6] bg-[rgba(139,92,246,0.15)] shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        : "border-[rgba(139,92,246,0.18)] bg-[#12101A]/60 hover:bg-[#12101A] hover:border-[rgba(139,92,246,0.35)]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? "text-[#A78BFA]" : "text-[#8C82A2]"}`} />
                    <h3 className="text-xs font-bold text-white mt-2">{r.title}</h3>
                    <p className="text-[11px] text-[#8C82A2] mt-1 leading-relaxed">{r.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
              >
                <span>Continue to Tool Selection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Step 2: Connected Execution Tools</h2>
              <p className="text-xs text-[#8C82A2] mt-0.5">
                Select which Model Context Protocol (MCP) integrations you wish to enable for agent runs.
              </p>
            </div>

            <div className="space-y-2.5">
              {INITIAL_TOOLS.map((tool) => {
                const active = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      active
                        ? "border-[#8B5CF6]/60 bg-[rgba(139,92,246,0.12)]"
                        : "border-[rgba(139,92,246,0.18)] bg-[#12101A]/60 hover:bg-[#12101A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          active
                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                            : "border-[#8C82A2] bg-transparent"
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{tool.name}</div>
                        <div className="text-[11px] text-[#8C82A2]">{tool.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181421] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
                      MCP
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#8C82A2] hover:text-[#F5F3FF] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
              >
                <span>Continue to First Goal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Step 3: Define Your Primary Objective</h2>
              <p className="text-xs text-[#8C82A2] mt-0.5">
                What would you like your first autonomous agent workflow to execute?
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={goalPreference}
                onChange={(e) => setGoalPreference(e.target.value)}
                rows={4}
                className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl p-3 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] resize-none transition-colors"
                placeholder="e.g., Build an automated verification pipeline for cloud infrastructure, synthesize system architecture, audit codebases..."
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] flex items-start gap-2.5 text-xs text-[#DDD6FE]">
              <Shield className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
              <span>
                Safety Guarantee: All high-impact tool actions will halt for explicit human confirmation in your HITL queue before execution.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-[#8C82A2] hover:text-[#F5F3FF] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
              >
                <span>{submitting ? "Configuring..." : "Launch LifeForge Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
