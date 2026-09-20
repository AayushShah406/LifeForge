"use client";

import Link from "next/link";
import { Zap, Shield } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-[rgba(139,92,246,0.18)] bg-[#07060B] text-[#8C82A2]">
      <div className="max-w-[1600px] 2xl:max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg text-[#F5F3FF] tracking-tight">LifeForge</span>
            </Link>
            <p className="text-sm text-[#8C82A2] leading-relaxed max-w-sm">
              The production-grade agentic personal operations platform. Converts high-level user goals into verified, multi-step tool-using workflows backed by Gemini 3 and LangGraph.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#8C82A2] font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12101A] border border-[rgba(139,92,246,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                Gemini 3 Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#12101A] border border-[rgba(139,92,246,0.2)]">
                <Shield className="w-3 h-3 text-[#A78BFA]" />
                Dual-Layer Verification
              </span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#DDD6FE]">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-[#C4B5FD] transition-colors">Core Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#C4B5FD] transition-colors">How It Works</Link></li>
              <li><Link href="/how-it-works#architecture" className="hover:text-[#C4B5FD] transition-colors">Agent Graph</Link></li>
              <li><Link href="/pricing" className="hover:text-[#C4B5FD] transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#C4B5FD] transition-colors">Workspace</Link></li>
            </ul>
          </div>

          {/* Col 2: Engineering & Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#DDD6FE]">AI Stack</h4>
            <ul className="space-y-2 text-sm text-[#8C82A2]">
              <li><span className="text-[#DDD6FE]">Gemini 3.1 Pro (Reasoning)</span></li>
              <li><span className="text-[#DDD6FE]">Gemini 3.8 Flash (Execution)</span></li>
              <li><span className="text-[#DDD6FE]">LangGraph Checkpointing</span></li>
              <li><span className="text-[#DDD6FE]">Weaviate Hybrid Memory</span></li>
              <li><span className="text-[#DDD6FE]">Model Context Protocol (MCP)</span></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#DDD6FE]">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#C4B5FD] transition-colors">About LifeForge</Link></li>
              <li><Link href="/about#safety" className="hover:text-[#C4B5FD] transition-colors">Safety & Governance</Link></li>
              <li><Link href="/login" className="hover:text-[#C4B5FD] transition-colors">Engineer Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-[#C4B5FD] transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(139,92,246,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C82A2]">
          <p>© {new Date().getFullYear()} LifeForge Systems Inc. Turn goals into verified actions.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#C4B5FD] transition-colors">Security First</span>
            <span className="hover:text-[#C4B5FD] transition-colors">Privacy Shield</span>
            <span className="hover:text-[#C4B5FD] transition-colors">Human-in-the-Loop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
