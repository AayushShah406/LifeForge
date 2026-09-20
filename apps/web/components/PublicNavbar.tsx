"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export function PublicNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Architecture", href: "/how-it-works#architecture" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(139,92,246,0.15)] bg-[#07060B]/85 backdrop-blur-xl">
      <div className="max-w-[1600px] 2xl:max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 2xl:px-20 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-[#F5F3FF]">
              LifeForge
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.18)] text-[#C4B5FD] border border-[rgba(139,92,246,0.35)]">
                AI OS
              </span>
            </div>
            <p className="text-[11px] text-[#8C82A2] font-medium tracking-wide">Turn goals into verified actions</p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 bg-[#12101A]/80 border border-[rgba(139,92,246,0.2)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "text-[#DDD6FE] bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.3)] shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "text-[#A197B4] hover:text-[#F5F3FF] hover:bg-[rgba(139,92,246,0.08)]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-3.5 py-2 text-xs font-semibold text-[#DDD6FE] hover:text-[#F5F3FF] transition-all rounded-xl hover:bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.25)]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all active:scale-95"
          >
            <span>Create Account</span>
            <Sparkles className="w-3.5 h-3.5" />
          </Link>
          {user && (
            <Link
              href="/command-center"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181421] border border-[rgba(139,92,246,0.3)] text-xs text-[#A78BFA] hover:text-white transition-colors"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#8C82A2] hover:text-white hover:bg-[rgba(139,92,246,0.1)]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(139,92,246,0.18)] bg-[#0C0A12]/95 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#DDD6FE] hover:text-white py-1"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-[rgba(139,92,246,0.18)] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-[rgba(139,92,246,0.3)] text-sm font-semibold text-[#DDD6FE] hover:text-white bg-[#12101A]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.35)]"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
