"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  Search,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useEffect, useState } from "react";
import { approvalsApi } from "@/lib/api/approvals";

export function Navbar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch pending approvals count
  useEffect(() => {
    async function loadPending() {
      try {
        const approvals = await approvalsApi.getPendingApprovals();
        setPendingCount(approvals.length);
      } catch {
        // Fallback to 0
      }
    }
    loadPending();
  }, [pathname]);

  // Compute breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb = pathSegments.length === 0
    ? "Dashboard"
    : pathSegments
        .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "))
        .join(" / ");

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <header className="h-16 border-b border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumb / Path */}
      <div className="flex items-center gap-2 text-xs text-[#8C82A2]">
        <Link href="/dashboard" className="text-[#8C82A2] hover:text-[#DDD6FE] transition-colors">
          LifeForge
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#5A5070]" />
        <span className="text-[#F5F3FF] font-medium capitalize">{breadcrumb}</span>
      </div>

      {/* Middle: Fast Search Bar Trigger */}
      <button
        onClick={triggerCommandPalette}
        className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12101A] hover:bg-[#181421] border border-[rgba(139,92,246,0.25)] text-xs text-[#8C82A2] hover:text-[#DDD6FE] transition-all shadow-sm group w-64 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#A78BFA] group-hover:scale-110 transition-transform" />
          <span>Search or command...</span>
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#1E192B] border border-[rgba(139,92,246,0.25)] text-[10px] text-[#A78BFA] font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Right: Status Badges & Quick Action */}
      <div className="flex items-center gap-3">
        {/* HITL Alerts Badge */}
        {pendingCount > 0 && (
          <Link
            href="/approvals"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(245,158,11,0.18)] border border-[rgba(245,158,11,0.35)] text-[#FBBF24] text-xs font-semibold hover:bg-[rgba(245,158,11,0.25)] transition-colors animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{pendingCount} Needs Review</span>
          </Link>
        )}

        {/* Engine Status */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[#34D399] border border-[rgba(16,185,129,0.25)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            LangGraph Online
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[rgba(139,92,246,0.1)] text-[#C4B5FD] border border-[rgba(139,92,246,0.25)] hidden lg:flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#A78BFA]" />
            Weaviate Ready
          </span>
        </div>

        {/* Quick Launch CTA */}
        <Link
          href="/command-center"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>New Goal</span>
        </Link>
      </div>
    </header>
  );
}
