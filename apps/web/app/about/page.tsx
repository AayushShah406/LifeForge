"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Target,
  Users,
  Lock,
  ArrowRight,
  GitBranch,
  Cpu,
  Database,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Turn Goals into Verified Actions
        </h1>
        <p className="text-base text-slate-400 leading-relaxed">
          LifeForge was born out of a simple conviction: AI shouldn&apos;t stop at answering questions. It must safely and reliably execute complex operations in the physical and digital world.
        </p>
      </div>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Action Over Conversation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chat interfaces are passive. When you say &quot;prepare me for my interview&quot; or &quot;audit our infrastructure&quot;, you need plans decomposed, code inspected, tools invoked, and output verified. LifeForge turns intent into reality.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Verification by Design</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We reject the idea of unmonitored agent autonomy. LifeForge requires automated dual-verification and human sign-off for critical operations, creating a trustable foundation for enterprise adoption.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0A0F1A] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Gemini 3 Native</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built from scratch to leverage Google&apos;s breakthrough Gemini 3 generation: Gemini 3.1 Pro for deep multi-step reasoning, Gemini 3.8 Flash for sub-second tool dispatch, and Gemini 3.1 Flash-Lite for edge efficiency.
          </p>
        </div>
      </div>

      {/* Safety & Governance Section */}
      <section id="safety" className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-[#0B1220]/90 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Safety & Governance Manifesto</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Commitments to Operational Trust</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">1. State Checkpoint Persistence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every workflow step is written to a deterministic append-only log in PostgreSQL. If a network blip occurs or an external API errors out, the state machine can resume or rollback without data loss.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">2. Strict Human Intervention Gates</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No workflow is allowed to perform state mutations (deleting files, sending emails, executing shell commands) without explicit human confirmation in the Approvals queue.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">3. Hybrid Sparse + Dense Grounding</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All agent research is cross-referenced against your uploaded documents in Weaviate Cloud v4, ensuring citations link directly to verifiable primary sources.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">4. Transparent Evaluation Trajectories</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We provide full trajectory visibility via LangSmith and OpenTelemetry metrics, so you know exactly which agent decided what, why, and how many tokens were consumed.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Ready to experience LifeForge?</h3>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all"
        >
          <span>Launch Your Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
