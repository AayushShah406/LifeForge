"use client";

import Link from "next/link";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Developer",
    price: "$0",
    period: "forever free",
    description: "Ideal for individual AI engineers exploring autonomous agent workflows.",
    features: [
      "50 workflow executions / month",
      "Gemini 3.8 Flash execution engine",
      "Up to 100 documents in Weaviate RAG",
      "Local stdio MCP tool calling",
      "PostgreSQL state checkpoints",
      "Community GitHub support",
    ],
    cta: "Start Free",
    href: "/signup",
    popular: false,
    badge: null,
  },
  {
    name: "Pro Operator",
    price: "$49",
    period: "per user / month",
    description: "For professionals and engineers orchestrating daily autonomous personal operations.",
    features: [
      "Unlimited workflow executions",
      "Gemini 3.1 Pro + 3.8 Flash auto-routing",
      "10,000 documents in Weaviate Cloud v4",
      "Continuous episodic semantic memory",
      "Remote SSE & stdio MCP tool integrations",
      "Dual-layer verification & HITL approval queues",
      "Full LangSmith tracing & evaluation metrics",
      "Priority API queue",
    ],
    cta: "Launch Pro Workspace",
    href: "/signup?plan=pro",
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual contract",
    description: "Dedicated infrastructure, custom MCP connectors, and enterprise security compliance.",
    features: [
      "Everything in Pro Operator",
      "Bring-your-own Gemini 3 & Weaviate API keys",
      "Isolated single-tenant LangGraph cluster",
      "Custom MCP servers & private VPC connections",
      "Role-based access control (RBAC)",
      "Dedicated solutions architect & 99.9% SLA",
      "Custom safety & compliance guardrail policies",
    ],
    cta: "Contact Solutions",
    href: "/about#contact",
    popular: false,
    badge: "Enterprise Grade",
  },
];

const FAQS = [
  {
    q: "Which Gemini models are used by LifeForge?",
    a: "LifeForge exclusively uses the latest Google Gemini 3 family: Gemini 3.1 Pro (for complex reasoning, plan decomposition, and synthesis), Gemini 3.8 Flash (for high-speed tool execution and sub-agent tasks), and Gemini 3.1 Flash-Lite (for metadata parsing and light classification).",
  },
  {
    q: "How does human-in-the-loop approval work?",
    a: "When an agent determines an action has potential real-world impact (such as making database changes, modifying code, sending emails, or calling financial endpoints), the LangGraph engine interrupts state execution. The workflow will not resume until you review and approve the task from your Approvals dashboard.",
  },
  {
    q: "Can I connect my own MCP (Model Context Protocol) servers?",
    a: "Yes! LifeForge natively supports any standard MCP server running over stdio or SSE. You can register tools dynamically via the Tools dashboard or our REST API.",
  },
  {
    q: "Where is my knowledge and memory stored?",
    a: "Documents and semantic memories are embedded using Google gemini-embedding-001 and stored in your dedicated Weaviate Cloud v4 vector collection, with full hybrid sparse/dense search indexing.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Predictable Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Invest in Autonomous Productivity
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          Simple, transparent tiers designed for individual AI practitioners and mission-critical engineering organizations.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all relative ${
              tier.popular
                ? "border-cyan-500/50 bg-[#0F1829]/90 shadow-2xl shadow-cyan-500/15"
                : "border-white/[0.08] bg-[#0A0E18]/80 hover:border-white/20"
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                {tier.badge}
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{tier.description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white font-mono">{tier.price}</span>
                <span className="text-xs text-slate-400 font-medium">{tier.period}</span>
              </div>

              <div className="border-t border-white/[0.08] pt-6 space-y-3">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Included capabilities:
                </p>
                <ul className="space-y-2.5">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href={tier.href}
                className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  tier.popular
                    ? "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10"
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Common Questions
          </h2>
          <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] space-y-2"
            >
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
