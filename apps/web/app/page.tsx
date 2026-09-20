"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  GitBranch,
  Database,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
  Activity,
  Terminal,
  ChevronRight,
  Wrench,
  ShieldAlert,
  Bot,
  Zap,
  CheckCircle2,
  Workflow,
  Check,
  X,
  ChevronDown,
  Layers,
  Star,
  Users,
  Code2,
  Globe,
  Clock,
  Sliders,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

// Real-world enterprise presets
const EXAMPLE_GOALS = [
  {
    title: "Interview Preparation",
    prompt: "Prepare me for my interview next Thursday: research company tech stack, synthesize relevant past projects from documents, and generate custom STAR practice questions.",
    category: "Career Ops",
  },
  {
    title: "AWS Cloud Audit",
    prompt: "Audit our staging AWS infrastructure for unattached EBS volumes and open security groups, generate remediation plan, and draft action tasks for review.",
    category: "DevOps",
  },
  {
    title: "Competitive Intelligence",
    prompt: "Synthesize public SEC 10-K filings and latest AI product releases of leading enterprise LLM platforms, and compile an executive briefing memo.",
    category: "Strategic Research",
  },
  {
    title: "SaaS Expense Reconciliation",
    prompt: "Audit recurring SaaS tools against team roster, flag orphaned accounts, calculate annualized savings, and prepare cancellation action tasks.",
    category: "Finance Ops",
  },
];

// Live Simulated AI Telemetry Stream
const AI_TELEMETRY_STREAM = [
  { agent: "SupervisorAgent", model: "Gemini 3.1 Pro", action: "Decomposing user goal into 4 stateful DAG stages...", tag: "REASONING" },
  { agent: "ResearchAgent", model: "Gemini 3.8 Flash", action: "Querying technical requirements and system architecture...", tag: "MCP_TOOL" },
  { agent: "MemoryAgent", model: "Weaviate Cloud", action: "Hybrid vector search matched 6 episodic candidate memories (score: 0.94)", tag: "RAG_RECALL" },
  { agent: "VerificationAgent", model: "Gemini 3.1 Pro", action: "Inspecting output criteria: 0 hallucinations, 100% constraints met", tag: "VERIFIED" },
  { agent: "CalendarAgent", model: "Google MCP", action: "Staged mock interview session. Awaiting HITL human sign-off", tag: "HITL_GATE" },
];

// Interactive Demo Scenarios
const DEMO_SCENARIOS = [
  {
    id: "interview",
    name: "Interview Ops",
    title: "Staff AI Engineer Interview Preparation",
    goal: "Prepare me for my interview next Thursday at NextGen AI Labs: extract job requirements, analyze resume, and schedule mock session.",
    nodes: [
      { id: "s1", name: "Supervisor Intent Analysis", agent: "SupervisorAgent", model: "Gemini 3.1 Pro", status: "completed", duration: "320ms", tokens: "412", output: "Identified high-impact career goal. Extracted target role: Staff AI Systems Engineer." },
      { id: "s2", name: "Weaviate Vector Recall", agent: "MemoryAgent", model: "Weaviate Cloud v4", status: "completed", duration: "185ms", tokens: "890", output: "Retrieved 8 relevant document chunks and 3 episodic preferences for interview timing." },
      { id: "s3", name: "Candidate Gap Analysis", agent: "DocumentAgent", model: "Gemini 3.8 Flash", status: "completed", duration: "490ms", tokens: "1,240", output: "Matched 92% core competencies. Highlighted distributed training as primary preparation area." },
      { id: "s4", name: "Calendar Staging & HITL Gate", agent: "CalendarAgent", model: "Google Calendar MCP", status: "waiting_approval", duration: "210ms", tokens: "320", output: "Proposed slot: Thursday Sept 24 @ 3:00 PM EST. External calendar mutation requires authorization." }
    ],
    hitlAction: {
      tool: "calendar_create_event",
      summary: "Schedule 60-min Mock Interview Preparation",
      time: "Thursday, September 24, 2026 • 3:00 PM – 4:00 PM EST",
      impact: "Creates external invite in connected Google Calendar"
    }
  },
  {
    id: "devops",
    name: "Cloud Ops",
    title: "Staging AWS Infrastructure Audit & Cost Remediation",
    goal: "Audit staging AWS infrastructure for unattached EBS volumes and open security groups, generate remediation plan, and draft action tasks.",
    nodes: [
      { id: "d1", name: "Supervisor Goal Decomposition", agent: "SupervisorAgent", model: "Gemini 3.1 Pro", status: "completed", duration: "290ms", tokens: "380", output: "Decomposed infrastructure audit into read-only inspection and remediation steps." },
      { id: "d2", name: "AWS MCP Read Inspection", agent: "ResearchAgent", model: "AWS MCP Server", status: "completed", duration: "640ms", tokens: "1,520", output: "Scanned 14 unattached gp3 EBS volumes (total $420/mo waste) and 2 unrestricted 0.0.0.0/0 rules." },
      { id: "d3", name: "Verification & Safety Inspection", agent: "VerificationAgent", model: "Gemini 3.1 Pro", status: "completed", duration: "410ms", tokens: "810", output: "Verified zero production impacts. Remediation actions marked non-destructive." },
      { id: "d4", name: "Deletion Confirmation Gate", agent: "PlanningAgent", model: "AWS MCP Server", status: "waiting_approval", duration: "180ms", tokens: "210", output: "Staged snapshot creation and volume detachment. Awaiting human clearance." }
    ],
    hitlAction: {
      tool: "aws_terminate_resources",
      summary: "Snapshot & Detach 14 Orphaned EBS Volumes",
      time: "Annualized savings: $5,040 USD across staging-us-east-1",
      impact: "Modifies AWS staging cloud resources"
    }
  },
  {
    id: "research",
    name: "Strategic RAG",
    title: "SEC 10-K Competitive Synthesis",
    goal: "Synthesize public SEC 10-K filings and latest AI product releases of leading enterprise LLM platforms, and compile an executive briefing memo.",
    nodes: [
      { id: "r1", name: "Decompose Research Dimensions", agent: "SupervisorAgent", model: "Gemini 3.1 Pro", status: "completed", duration: "310ms", tokens: "520", output: "Formulated research vectors: CapEx trends, token economics, and enterprise retention." },
      { id: "r2", name: "Dense/Sparse Weaviate RAG", agent: "ResearchAgent", model: "Weaviate Cloud v4", status: "completed", duration: "380ms", tokens: "2,100", output: "Extracted 24 relevant filing excerpts with 768-dim Google embeddings." },
      { id: "r3", name: "Executive Memo Synthesis", agent: "PlannerAgent", model: "Gemini 3.1 Pro", status: "completed", duration: "820ms", tokens: "3,400", output: "Generated 4-page structured strategic briefing with cited sources and confidence scores." },
      { id: "r4", name: "Email Recipient Dispatch Gate", agent: "EmailAgent", model: "Gmail MCP Server", status: "waiting_approval", duration: "240ms", tokens: "410", output: "Staged email to leadership team. External transmission requires authorization." }
    ],
    hitlAction: {
      tool: "email_send_draft",
      summary: "Dispatch Executive AI Briefing to Leadership Team",
      time: "Recipients: 4 executive team stakeholders",
      impact: "Sends external email communication via Gmail API"
    }
  }
];

// Comparison Matrix: Chatbot vs LifeForge
const COMPARISON_ROWS = [
  {
    feature: "Execution Model",
    chatbot: "Single-turn text prediction in ephemeral chat",
    lifeforge: "Stateful cyclic LangGraph multi-agent DAG with deterministic checkpointing",
    icon: GitBranch
  },
  {
    feature: "External Tool Calling",
    chatbot: "Isolated sandbox or unverified web search",
    lifeforge: "Model Context Protocol (MCP) connecting PostgreSQL, Google Calendar, AWS, and terminal",
    icon: Wrench
  },
  {
    feature: "Memory & Personal Context",
    chatbot: "Flushed on session close; context window overflow",
    lifeforge: "Weaviate Cloud v4 hybrid vector memory + 22 PostgreSQL persistence tables",
    icon: Database
  },
  {
    feature: "Safety & Human Oversight",
    chatbot: "No interruption gates; risk of unchecked hallucinated actions",
    lifeforge: "Dual-layer automated verification + Human-in-the-Loop (HITL) authorization gates",
    icon: ShieldAlert
  },
  {
    feature: "Model Cost Optimization",
    chatbot: "Single expensive flagship model for all queries",
    lifeforge: "Dynamic Gemini 3 routing (Pro reasoning, Flash tools, Lite tagging) saving up to 82%",
    icon: Cpu
  },
  {
    feature: "Observability & Audit Trail",
    chatbot: "Black-box opaque responses with zero lineage",
    lifeforge: "Full trajectory recording, step latencies, token costs, and LangSmith lineage",
    icon: Activity
  }
];

// SaaS Capabilities
const CAPABILITIES = [
  {
    icon: Cpu,
    title: "Gemini 3 Intelligent Routing",
    description:
      "Dynamically assigns tasks across Gemini 3.1 Pro (complex reasoning & synthesis), 3.8 Flash (rapid execution & tool calls), and 3.1 Flash-Lite (metadata & categorization).",
    badge: "3-Model Stack",
    color: "from-[#7C3AED]/20 to-[#A855F7]/10",
    borderColor: "border-[rgba(139,92,246,0.3)]",
  },
  {
    icon: GitBranch,
    title: "LangGraph Multi-Agent Workflows",
    description:
      "Cyclic agent graphs with deterministic checkpointing, state rewind, human interruptions, and dynamic sub-task routing that handle failures gracefully.",
    badge: "Stateful Graph",
    color: "from-[#6D28D9]/20 to-[#8B5CF6]/10",
    borderColor: "border-[rgba(139,92,246,0.3)]",
  },
  {
    icon: Database,
    title: "Weaviate Hybrid Knowledge RAG",
    description:
      "Seamlessly connects personal documents, resumes, policies, and semantic memory vectors with hybrid sparse/dense search powered by Google Embeddings.",
    badge: "Hybrid Vector DB",
    color: "from-[#5B21B6]/25 to-[#7C3AED]/10",
    borderColor: "border-[rgba(139,92,246,0.3)]",
  },
  {
    icon: ShieldAlert,
    title: "Dual-Layer Verification & HITL",
    description:
      "Automated verification agents check output accuracy and safety criteria before sensitive actions require explicit human approval.",
    badge: "Zero Unchecked Actions",
    color: "from-[#F59E0B]/15 to-[#B45309]/10",
    borderColor: "border-[rgba(245,158,11,0.35)]",
  },
  {
    icon: Wrench,
    title: "Model Context Protocol (MCP)",
    description:
      "Universal tool connectivity: execute filesystem actions, database queries, terminal commands, and third-party APIs through standard MCP servers.",
    badge: "Universal Tools",
    color: "from-[#7C3AED]/15 to-[#6D28D9]/15",
    borderColor: "border-[rgba(139,92,246,0.3)]",
  },
  {
    icon: Activity,
    title: "Full Trajectory Observability",
    description:
      "Every token, tool call, step latency, evaluation score, and graph state transition is captured with LangSmith and OpenTelemetry lineage.",
    badge: "Production Tracing",
    color: "from-[#8B5CF6]/20 to-[#4C1D95]/20",
    borderColor: "border-[rgba(139,92,246,0.3)]",
  },
];

// Pricing Plans
const PRICING_PLANS = [
  {
    name: "Developer Sandbox",
    price: "$0",
    cadence: "Free forever",
    description: "Ideal for engineers testing autonomous agents and personal operations.",
    features: [
      "50 verified workflow runs / month",
      "Gemini 3.8 Flash execution engine",
      "Weaviate in-memory vector store",
      "5 connected MCP tools",
      "HITL approval checkpointing",
      "Community Discord support"
    ],
    cta: "Start Free Sandbox",
    href: "/signup",
    popular: false
  },
  {
    name: "Pro Engineer",
    price: "$29",
    cadence: "per seat / month",
    description: "Complete autonomous power with Gemini 3.1 Pro reasoning and Weaviate Cloud.",
    features: [
      "Unlimited workflow executions",
      "Gemini 3.1 Pro + 3.8 Flash model routing",
      "Weaviate Cloud v4 persistent collections",
      "Full MCP tool suite (SQL, Google, Terminal)",
      "Automated verification & reflection loops",
      "LangSmith audit trail & token tracking",
      "Priority API latency & SLA"
    ],
    cta: "Launch Pro Workspace",
    href: "/signup",
    popular: true
  },
  {
    name: "Team & Enterprise",
    price: "$99",
    cadence: "per organization / month",
    description: "Multi-tenant governance, private cloud deployment, and custom MCP integrations.",
    features: [
      "Dedicated multi-agent orchestration cluster",
      "Custom MCP servers & private VPC connectors",
      "Strict RBAC & SOC2 audit logging",
      "Custom vector schema & fine-tuned embeddings",
      "Enterprise SSO (Okta, SAML, Google Workspace)",
      "99.95% Execution SLA guarantee",
      "Dedicated AI Solutions Architect"
    ],
    cta: "Contact Enterprise Sales",
    href: "/signup",
    popular: false
  }
];

// FAQs
const FAQS = [
  {
    q: "How does LifeForge differ from standard chatbots like ChatGPT or Claude?",
    a: "Standard chatbots generate text responses within a chat window. LifeForge is an agentic operations platform: it uses LangGraph state machines to break high-level goals into dependency-aware DAGs, runs specialized autonomous agents, retrieves knowledge from Weaviate Cloud, executes real tools via MCP, and pauses at Human-in-the-Loop gates before mutating external state."
  },
  {
    q: "What is the Human-in-the-Loop (HITL) approval gate?",
    a: "Sensitive operations—such as sending emails, deleting cloud volumes, or scheduling meetings—are flagged as non-idempotent. The workflow automatically transitions to a 'waiting_for_approval' state, snapshots its complete state in PostgreSQL, and requires your explicit authorization before proceeding."
  },
  {
    q: "How does Gemini 3 intelligent model routing save token costs?",
    a: "LifeForge automatically routes complex strategic planning and verification to Gemini 3.1 Pro ($1.25/1M), tool calling and document ingestion to Gemini 3.8 Flash ($0.075/1M), and lightweight tagging to Gemini 3.1 Flash-Lite ($0.025/1M). This yields up to an 82% cost reduction compared to using a single flagship model for all tasks."
  },
  {
    q: "Can I connect my own databases, APIs, and tools?",
    a: "Yes. LifeForge is built natively on Anthropic's Model Context Protocol (MCP). You can connect PostgreSQL databases, filesystem directories, Google Workspace (Calendar, Gmail), AWS infrastructure, and custom internal MCP servers with zero code changes."
  },
  {
    q: "Is my personal data and document context secure?",
    a: "All uploaded documents and semantic memories are isolated with multi-tenant UUID user isolation in Weaviate Cloud v4 and PostgreSQL. Data is never used for foundation model pretraining, and every tool interaction is captured in an immutable audit trail."
  }
];

export default function HomePage() {
  const router = useRouter();
  const [goalText, setGoalText] = useState("");
  const [activeTelemetryIndex, setActiveTelemetryIndex] = useState(0);
  const [activeDemoScenario, setActiveDemoScenario] = useState("interview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [demoApproved, setDemoApproved] = useState(false);

  // Rotate AI telemetry feed
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTelemetryIndex((prev) => (prev + 1) % AI_TELEMETRY_STREAM.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    router.push(`/command-center?q=${encodeURIComponent(goalText)}`);
  };

  const handleSelectPreset = (prompt: string) => {
    setGoalText(prompt);
  };

  const currentScenario = DEMO_SCENARIOS.find((s) => s.id === activeDemoScenario) || DEMO_SCENARIOS[0];
  const activeTelemetry = AI_TELEMETRY_STREAM[activeTelemetryIndex];

  return (
    <div className="w-full space-y-24 md:space-y-32 py-8 md:py-16 relative">
      {/* 1. HERO SECTION — Full Bleed Immersive Visuals */}
      <section className="relative w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto text-center space-y-8">
        {/* Violet ambient atmosphere & animated chromatic glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/25 via-[#8B5CF6]/20 to-[#A855F7]/12 blur-[150px] pointer-events-none rounded-full animate-pulse-slow" />

        {/* Floating AI System Micro-Badges on Viewport Edges */}
        <div className="hidden xl:flex items-center gap-2.5 absolute top-12 left-12 px-3.5 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.35)] backdrop-blur-md shadow-[0_0_25px_rgba(139,92,246,0.2)] text-[11px] font-mono text-[#DDD6FE] animate-ai-float pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] neural-pulse-dot" />
          <Cpu className="w-4 h-4 text-[#A78BFA]" />
          <span>Gemini 3.1 Pro (Reasoning Engine)</span>
        </div>

        <div className="hidden xl:flex items-center gap-2.5 absolute top-12 right-12 px-3.5 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.35)] backdrop-blur-md shadow-[0_0_25px_rgba(139,92,246,0.2)] text-[11px] font-mono text-[#DDD6FE] animate-ai-float-delayed pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#34D399] neural-pulse-dot" />
          <Database className="w-4 h-4 text-[#34D399]" />
          <span>Weaviate Cloud v4 (Hybrid RAG)</span>
        </div>

        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[rgba(139,92,246,0.4)] bg-[rgba(139,92,246,0.12)] text-[#DDD6FE] text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
          <span>LifeForge — Autonomous AI Operations Platform</span>
        </div>

        {/* Hero Headings */}
        <div className="space-y-5 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turn High-Level Goals Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#DDD6FE] to-[#A78BFA] drop-shadow-[0_0_35px_rgba(139,92,246,0.45)]">
              Verified Autonomous Actions.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A197B4] max-w-3xl mx-auto leading-relaxed">
            Move beyond chatbots. LifeForge connects multi-agent LangGraph workflows, Gemini 3 model routing, Weaviate vector memory, and guarded MCP tools to execute real engineering and personal operations.
          </p>
        </div>

        {/* Quick Launch & Auth Action Row with AI Shimmer */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            id="hero-create-account-btn"
            href="/signup"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] transition-all active:scale-95 group"
          >
            <span>Create Free Workspace</span>
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </Link>
          <Link
            id="hero-signin-btn"
            href="/login"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#12101A] hover:bg-[#181421] border border-[rgba(139,92,246,0.35)] hover:border-[#8B5CF6] text-[#DDD6FE] hover:text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            <span>Sign In to Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#live-interactive-demo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[rgba(139,92,246,0.08)] hover:bg-[rgba(139,92,246,0.16)] border border-[rgba(139,92,246,0.25)] text-[#C4B5FD] hover:text-white text-xs sm:text-sm font-semibold transition-all"
          >
            <span>Explore Live Demo</span>
            <ChevronDown className="w-4 h-4 text-[#A78BFA]" />
          </a>
        </div>

        {/* Live Autonomous AI Trajectory Ticker */}
        <div className="max-w-4xl mx-auto pt-2">
          <div className="p-3 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.25)] backdrop-blur-md flex items-center justify-between gap-3 text-xs shadow-[0_0_25px_rgba(139,92,246,0.14)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] neural-pulse-dot shrink-0" />
              <span className="font-mono text-[10px] text-[#A78BFA] bg-[#181421] px-2 py-0.5 rounded border border-[rgba(139,92,246,0.3)] shrink-0">
                {activeTelemetry.tag}
              </span>
              <span className="font-semibold text-[#DDD6FE] shrink-0 font-mono text-[11px]">
                [{activeTelemetry.agent}]
              </span>
              <span className="text-[#A197B4] text-[11px] truncate text-left">
                {activeTelemetry.action}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-[#8C82A2]">
              <Activity className="w-3.5 h-3.5 text-[#34D399]" />
              <span>LangGraph Active</span>
            </div>
          </div>
        </div>

        {/* Interactive Goal Execution Box with AI Border Beam */}
        <div className="max-w-4xl mx-auto text-left relative z-10 pt-2">
          <form
            onSubmit={handleExecute}
            className="p-5 rounded-2xl bg-[#0C0A12]/95 border border-[rgba(139,92,246,0.35)] shadow-[0_0_60px_rgba(139,92,246,0.22)] backdrop-blur-xl space-y-4 ai-border-beam"
          >
            <div className="flex items-center justify-between px-1 text-xs text-[#8C82A2] font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-white font-medium">Goal Input Engine (Gemini 3.1 Pro Supervisor)</span>
              </div>
              <span className="text-[10px] text-[#34D399] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                11 Guarded MCP Tools
              </span>
            </div>
            <textarea
              id="home-goal-input"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Prepare me for my interview next Thursday: research company tech stack, synthesize past projects, and create practice questions..."
              rows={3}
              className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl p-4 text-sm text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] resize-none transition-all shadow-inner"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#A197B4]">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                <span>Verification reflection loop & HITL approval active</span>
              </div>
              <button
                id="home-launch-workflow-btn"
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Launch Agent Workflow</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Preset Badges */}
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-mono text-[#8C82A2] uppercase tracking-wider">
              Try an enterprise preset:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXAMPLE_GOALS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(preset.prompt)}
                  className="p-3.5 rounded-xl bg-[#0C0A12]/80 hover:bg-[#12101A] border border-[rgba(139,92,246,0.18)] hover:border-[rgba(139,92,246,0.4)] text-left transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[#DDD6FE] group-hover:text-[#F5F3FF]">
                    <span>{preset.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181421] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C82A2] truncate mt-1">
                    {preset.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Badges Strip with Subtle Glow */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/80 backdrop-blur-md hover:border-[rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] text-left">
            <div className="text-3xl font-bold font-mono text-[#A78BFA]">3 Models</div>
            <div className="text-xs text-[#8C82A2] mt-1">Gemini 3 Family Dynamic Routing</div>
          </div>
          <div className="p-4 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/80 backdrop-blur-md hover:border-[rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] text-left">
            <div className="text-3xl font-bold font-mono text-[#C4B5FD]">100%</div>
            <div className="text-xs text-[#8C82A2] mt-1">LangGraph State Checkpointing</div>
          </div>
          <div className="p-4 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/80 backdrop-blur-md hover:border-[rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] text-left">
            <div className="text-3xl font-bold font-mono text-[#DDD6FE]">Dual-Gate</div>
            <div className="text-xs text-[#8C82A2] mt-1">Automated + Human Verification</div>
          </div>
          <div className="p-4 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/80 backdrop-blur-md hover:border-[rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] text-left">
            <div className="text-3xl font-bold font-mono text-[#34D399]">11 MCP</div>
            <div className="text-xs text-[#8C82A2] mt-1">Universal Tool Call Registry</div>
          </div>
        </div>
      </section>

      {/* 2. LOGOS / SOCIAL PROOF STRIP — Full Bleed */}
      <section className="w-full border-y border-[rgba(139,92,246,0.15)] bg-[#0C0A12]/60 backdrop-blur-md py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-mono text-[#8C82A2] uppercase tracking-wider shrink-0">
            Trusted by autonomous systems engineers from:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-65 text-xs font-mono font-semibold text-[#DDD6FE]">
            <span className="hover:text-white transition-colors">GOOGLE CLOUD</span>
            <span className="hover:text-white transition-colors">WEAVIATE</span>
            <span className="hover:text-white transition-colors">LANGCHAIN</span>
            <span className="hover:text-white transition-colors">VERCEL</span>
            <span className="hover:text-white transition-colors">SUPABASE</span>
            <span className="hover:text-white transition-colors">DATADOG</span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE PRODUCT DEMO / COMMAND CENTER PREVIEW */}
      <section id="live-interactive-demo" className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#A78BFA] font-mono">
            <Workflow className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See the Autonomous Command Center in Action
          </h2>
          <p className="text-sm text-[#8C82A2]">
            Explore how LifeForge coordinates specialized agents, checkpoints state transitions, and halts at Human-in-the-Loop gates.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0C0A12] border border-[rgba(139,92,246,0.2)] max-w-md mx-auto">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveDemoScenario(s.id);
                setDemoApproved(false);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeDemoScenario === s.id
                  ? "bg-[#181421] text-white border border-[rgba(139,92,246,0.4)] shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "text-[#8C82A2] hover:text-[#DDD6FE]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Live Interactive Dashboard Frame */}
        <div className="rounded-3xl border border-[rgba(139,92,246,0.3)] bg-[#0C0A12]/95 backdrop-blur-2xl shadow-[0_0_70px_rgba(139,92,246,0.15)] overflow-hidden ai-border-beam">
          {/* Top Frame Bar */}
          <div className="p-4 border-b border-[rgba(139,92,246,0.15)] bg-[#12101A]/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
              </div>
              <span className="text-xs font-mono text-[#DDD6FE] font-medium truncate">
                workflow://{currentScenario.id}-cluster/run-9482
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LangGraph Checkpoint: Healthy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181421] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
                Cost: $0.0019
              </span>
            </div>
          </div>

          {/* Frame Body: Multi-column view */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[rgba(139,92,246,0.15)]">
            {/* Left: Trajectory DAG Steps (8 cols) */}
            <div className="lg:col-span-8 p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#8C82A2] uppercase tracking-wider">Active Objective</span>
                <p className="text-sm font-semibold text-white">{currentScenario.goal}</p>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono text-[#A78BFA] uppercase tracking-wider">
                  Stateful Execution Trajectory (4 Steps)
                </span>
                <div className="space-y-2.5">
                  {currentScenario.nodes.map((node, i) => (
                    <div
                      key={node.id}
                      className="p-3.5 rounded-xl border border-[rgba(139,92,246,0.18)] bg-[#12101A]/60 space-y-2 hover:border-[rgba(139,92,246,0.35)] transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#181421] border border-[rgba(139,92,246,0.3)] flex items-center justify-center font-mono text-[10px] text-[#A78BFA]">
                            0{i + 1}
                          </span>
                          <span className="font-bold text-white">{node.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181421] text-[#DDD6FE]">
                            {node.agent}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C82A2]">
                          <span>{node.duration}</span>
                          <span>•</span>
                          <span>{node.tokens} tok</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#A197B4] pl-7">{node.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Human-in-the-Loop Clearance Gate (4 cols) */}
            <div className="lg:col-span-4 p-6 space-y-5 bg-[#0C0A12]/60 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      HITL Clearance Gate
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    demoApproved
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {demoApproved ? "AUTHORIZED" : "AWAITING SIGN-OFF"}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400">Guarded Tool Call</span>
                    <p className="text-xs font-bold text-white font-mono">{currentScenario.hitlAction.tool}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#8C82A2]">Action Payload</span>
                    <p className="text-xs text-[#DDD6FE]">{currentScenario.hitlAction.summary}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#8C82A2]">Impact Scope</span>
                    <p className="text-[11px] text-[#A197B4]">{currentScenario.hitlAction.impact}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                {demoApproved ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Action successfully authorized & executed into graph state.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDemoApproved(true)}
                      className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize</span>
                    </button>
                    <button
                      onClick={() => alert("Action rejected in sandbox demonstration.")}
                      className="py-2.5 px-4 rounded-xl bg-[#181421] hover:bg-[#201A2D] border border-[rgba(139,92,246,0.3)] text-[#DDD6FE] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
                <span className="text-[10px] text-center text-[#8C82A2] block">
                  Interactive simulation of LifeForge LangGraph checkpointing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON MATRIX: Chatbots vs LifeForge — Full Bleed */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#A78BFA] font-mono">
            <Sliders className="w-3.5 h-3.5" />
            <span>Why Architecture Matters</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Traditional Chatbots vs LifeForge Agentic Platform
          </h2>
          <p className="text-sm text-[#8C82A2]">
            Chatbots write text about work. LifeForge plans, coordinates, verifies, and executes real work.
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/90 backdrop-blur-md overflow-x-auto shadow-[0_0_50px_rgba(139,92,246,0.1)]">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[rgba(139,92,246,0.2)] bg-[#12101A]/80 text-[#8C82A2] font-mono text-[11px]">
                <th className="p-4 pl-6">Core Dimension</th>
                <th className="p-4 text-zinc-400">Standard Chatbot (ChatGPT / Claude Web)</th>
                <th className="p-4 text-[#A78BFA] font-bold">LifeForge Agentic Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(139,92,246,0.1)] text-[#DDD6FE]">
              {COMPARISON_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.feature} className="hover:bg-[#12101A]/40 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#A78BFA]" />
                      <span>{row.feature}</span>
                    </td>
                    <td className="p-4 text-[#8C82A2]">{row.chatbot}</td>
                    <td className="p-4 text-white font-medium bg-[rgba(139,92,246,0.06)] border-l border-[rgba(139,92,246,0.15)]">
                      {row.lifeforge}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. BENTO GRID OF CAPABILITIES */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
            System Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Autonomous Reliability
          </h3>
          <p className="text-sm text-[#8C82A2]">
            Built from first principles for mission-critical tasks where hallucinated answers or rogue tool actions are not tolerated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className={`p-6 rounded-2xl border ${cap.borderColor} bg-gradient-to-br ${cap.color} bg-[#0C0A12]/90 backdrop-blur-md space-y-4 hover:translate-y-[-3px] hover:shadow-[0_0_30px_rgba(139,92,246,0.22)] transition-all duration-300 relative group overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-2xl group-hover:bg-[#8B5CF6]/15 transition-all" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.25)] flex items-center justify-center group-hover:border-[#8B5CF6] transition-colors">
                    <Icon className="w-5 h-5 text-[#DDD6FE]" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181421] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]">
                    {cap.badge}
                  </span>
                </div>
                <div className="space-y-1.5 relative z-10">
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-[#F5F3FF] transition-colors">{cap.title}</h4>
                  <p className="text-xs text-[#A197B4] leading-relaxed">{cap.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW IT WORKS 4-STEP WORKFLOW WITH ANIMATED DATA PACKET CONNECTOR */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
            Workflow Lifecycle
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            From Ambiguous Goal to Verified Execution
          </h3>
          <p className="text-sm text-[#8C82A2]">
            Every run passes through a 4-phase stateful pipeline designed to guarantee safety, transparency, and deterministic execution.
          </p>
        </div>

        {/* Connecting Luminous Track for Large Screens */}
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C3AED]/20 via-[#8B5CF6]/40 to-[#10B981]/30 -translate-y-1/2 z-0">
            <div className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-[#C4B5FD] to-transparent animate-ai-packet" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-md space-y-3 hover:border-[#8B5CF6] hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-[#8B5CF6]/60">01</span>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] neural-pulse-dot" />
              </div>
              <h4 className="text-sm font-bold text-white">Understand & Clarify</h4>
              <p className="text-xs text-[#8C82A2] leading-relaxed">
                Gemini 3.1 Pro decomposes the goal into explicit milestones and prompts for human clarification if crucial parameters are absent.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-md space-y-3 hover:border-[#A78BFA] hover:shadow-[0_0_25px_rgba(139,92,246,0.2)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-[#A78BFA]/60">02</span>
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] neural-pulse-dot" />
              </div>
              <h4 className="text-sm font-bold text-white">Retrieve & Plan</h4>
              <p className="text-xs text-[#8C82A2] leading-relaxed">
                Synthesizes personal documents and episodic memory via Weaviate Cloud dense/sparse search, assembling a sequenced tool DAG.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-md space-y-3 hover:border-[#F59E0B] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-[#F59E0B]/60">03</span>
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] neural-pulse-dot" />
              </div>
              <h4 className="text-sm font-bold text-white">Verify & Gate</h4>
              <p className="text-xs text-[#8C82A2] leading-relaxed">
                A dedicated verification agent checks for hallucinations and policy violations. High-impact operations halt for human approval.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-md space-y-3 hover:border-[#10B981] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold font-mono text-[#10B981]/60">04</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] neural-pulse-dot" />
              </div>
              <h4 className="text-sm font-bold text-white">Execute & Record</h4>
              <p className="text-xs text-[#8C82A2] leading-relaxed">
                Gemini 3.8 Flash dispatches MCP tools with full trajectory recording, token attribution, and downstream evaluation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ENTERPRISE SAAS PRICING TIERS PREVIEW */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#A78BFA] font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Predictable Costs. Unlimited Potential.
          </h2>
          <p className="text-sm text-[#8C82A2]">
            Start free with full sandbox access. Upgrade as your agent operations scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-3xl border flex flex-col justify-between space-y-6 transition-all relative ${
                plan.popular
                  ? "border-[#8B5CF6] bg-[#12101A]/90 shadow-[0_0_40px_rgba(139,92,246,0.25)] ai-border-beam"
                  : "border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/90 hover:border-[rgba(139,92,246,0.35)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-[#8C82A2]">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white font-mono">{plan.price}</span>
                  <span className="text-xs text-[#8C82A2] font-mono">{plan.cadence}</span>
                </div>
                <div className="border-t border-[rgba(139,92,246,0.15)] pt-4 space-y-2.5">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-[#DDD6FE]">
                      <Check className="w-4 h-4 text-[#34D399] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white shadow-[0_0_25px_rgba(139,92,246,0.4)]"
                    : "bg-[#181421] hover:bg-[#201A2D] border border-[rgba(139,92,246,0.3)] text-[#DDD6FE] hover:text-white"
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ENTERPRISE GOVERNANCE & SECURITY */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border border-[rgba(139,92,246,0.25)] bg-[#0C0A12]/95 backdrop-blur-xl grid grid-cols-1 md:grid-cols-3 gap-8 shadow-[0_0_50px_rgba(139,92,246,0.1)] ai-border-beam relative">
          <div className="md:col-span-1 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.3)] flex items-center justify-center text-[#A78BFA]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Enterprise Governance by Default</h3>
            <p className="text-xs text-[#8C82A2] leading-relaxed">
              LifeForge was designed for teams handling sensitive documents, API credentials, and internal workflows.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.18)] space-y-1 hover:border-[rgba(139,92,246,0.35)] transition-colors">
              <h4 className="text-xs font-bold text-[#DDD6FE]">Zero Unchecked Tool Actions</h4>
              <p className="text-[11px] text-[#8C82A2] leading-relaxed">
                State machine interrupts guarantee that non-idempotent actions (emails, cloud resource modifications, payments) never execute without human sign-off.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.18)] space-y-1 hover:border-[rgba(139,92,246,0.35)] transition-colors">
              <h4 className="text-xs font-bold text-[#DDD6FE]">Granular Agent Role Isolation</h4>
              <p className="text-[11px] text-[#8C82A2] leading-relaxed">
                Planner, Researcher, Executor, and Verifier agents run with strict boundary separation and least-privilege tool access.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.18)] space-y-1 hover:border-[rgba(139,92,246,0.35)] transition-colors">
              <h4 className="text-xs font-bold text-[#DDD6FE]">Full Audit Trajectory</h4>
              <p className="text-[11px] text-[#8C82A2] leading-relaxed">
                Every prompt, tool payload, and model intermediate token is persisted in PostgreSQL with replayable run history.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#12101A] border border-[rgba(139,92,246,0.18)] space-y-1 hover:border-[rgba(139,92,246,0.35)] transition-colors">
              <h4 className="text-xs font-bold text-[#DDD6FE]">Model Fallback & Quota Routing</h4>
              <p className="text-[11px] text-[#8C82A2] leading-relaxed">
                Automated degradation to Gemini 3.8 Flash during high demand, ensuring zero workflow stoppages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE FAQ ACCORDION */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1200px] mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#A78BFA] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#8C82A2]">Everything you need to know about the platform architecture.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-[rgba(139,92,246,0.2)] bg-[#0C0A12]/90 backdrop-blur-md overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#12101A]/40 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A78BFA] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#A197B4] leading-relaxed border-t border-[rgba(139,92,246,0.1)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FULL BLEED CTA SECTION */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-20 max-w-[1600px] mx-auto text-center space-y-6 relative">
        <div className="p-10 sm:p-16 rounded-3xl border border-[rgba(139,92,246,0.35)] bg-gradient-to-b from-[#12101A] to-[#0C0A12] shadow-[0_0_80px_rgba(139,92,246,0.2)] space-y-6 ai-border-beam relative">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to automate real work with verified AI agents?
            </h2>
            <p className="text-sm sm:text-base text-[#A197B4] max-w-xl mx-auto">
              Deploy your personal AI operations platform today. Includes 50 free workflow runs with Gemini 3 and Weaviate RAG.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              id="cta-signup-btn"
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-sm font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all group"
            >
              <span>Create Free Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              id="cta-login-btn"
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#181421] hover:bg-[#201A2D] border border-[rgba(139,92,246,0.35)] text-[#DDD6FE] hover:text-white text-sm font-semibold transition-all shadow-sm"
            >
              <span>Sign In</span>
            </Link>
          </div>
          <span className="text-[11px] text-[#8C82A2] block font-mono">
            No credit card required • Instant provisioning • 100% LangGraph Checkpointed
          </span>
        </div>
      </section>
    </div>
  );
}
