"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  GitBranch,
  CheckSquare,
  ShieldAlert,
  FileText,
  Brain,
  Search,
  Wrench,
  Network,
  Users,
  Activity,
  Award,
  Settings,
  Terminal,
  Zap,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const SECTIONS: NavSection[] = [
  {
    title: "Operations",
    items: [
      { name: "Command Center", href: "/command-center", icon: Compass },
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Workflows", href: "/workflows", icon: GitBranch },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
      { name: "HITL Approvals", href: "/approvals", icon: ShieldAlert, badge: "HITL" },
    ],
  },
  {
    title: "Knowledge & Memory",
    items: [
      { name: "Documents", href: "/knowledge/documents", icon: FileText },
      { name: "Semantic Memory", href: "/knowledge/memories", icon: Brain },
      { name: "Hybrid Search", href: "/knowledge/search", icon: Search },
    ],
  },
  {
    title: "Tools & Ecosystem",
    items: [
      { name: "MCP Tools", href: "/tools/mcp", icon: Wrench },
      { name: "Integrations", href: "/tools/integrations", icon: Network },
    ],
  },
  {
    title: "AI Reliability & Ops",
    items: [
      { name: "Agents Graph", href: "/agents", icon: Users },
      { name: "Observability", href: "/observability", icon: Activity },
      { name: "Evaluations", href: "/evaluations", icon: Award },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Developer API", href: "/developer", icon: Terminal },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 border-r border-[rgba(139,92,246,0.18)] bg-[#0C0A12] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-[rgba(139,92,246,0.15)] shrink-0 bg-[#07060B]/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight flex items-center gap-1.5 text-[#F5F3FF]">
              LifeForge
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(139,92,246,0.2)] text-[#C4B5FD] border border-[rgba(139,92,246,0.35)]">
                AI OS
              </span>
            </div>
            <p className="text-[10px] text-[#8C82A2] font-medium">Turn goals into verified actions</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#8C82A2] font-semibold">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? "bg-[rgba(139,92,246,0.14)] text-[#DDD6FE] border border-[rgba(139,92,246,0.35)] shadow-[0_0_15px_rgba(139,92,246,0.12)] font-semibold"
                        : "text-[#A197B4] hover:text-[#F5F3FF] hover:bg-[rgba(139,92,246,0.06)] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-[#A78BFA]" : "text-[#8C82A2] group-hover:text-[#DDD6FE]"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.2)] text-[#FBBF24] border border-[rgba(245,158,11,0.35)] animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Model Router Badge + User Row */}
      <div className="p-3 border-t border-[rgba(139,92,246,0.15)] shrink-0 space-y-2 bg-[#07060B]">
        {/* Model Router Pill */}
        <div className="p-2.5 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[#12101A] text-[11px] shadow-sm">
          <div className="flex items-center justify-between text-[#DDD6FE] mb-1.5">
            <span className="font-semibold flex items-center gap-1.5 text-[10px] text-[#A78BFA]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A78BFA]" />
              Gemini 3 Router
            </span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </div>
          <div className="space-y-1 font-mono text-[10px] text-[#8C82A2]">
            <div className="flex justify-between">
              <span>Reasoning:</span>
              <span className="text-[#C4B5FD] font-semibold">3.1 Pro</span>
            </div>
            <div className="flex justify-between">
              <span>Ops / Tools:</span>
              <span className="text-[#A78BFA]">3.8 Flash</span>
            </div>
          </div>
        </div>

        {/* User Account Row */}
        <div className="flex items-center justify-between pt-1 px-1 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="text-[#F5F3FF] font-medium truncate text-[11px]">
                {user?.full_name || "AI Engineer"}
              </p>
              <p className="text-[#8C82A2] text-[10px] truncate">{user?.email || "engineer@lifeforge.ai"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-[#8C82A2] hover:text-[#EF4444] rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
