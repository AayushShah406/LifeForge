"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { NeuralBackground } from "@/components/NeuralBackground";
import { CommandPalette } from "@/components/CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public marketing pages
  const isPublicPage =
    pathname === "/" ||
    pathname === "/features" ||
    pathname === "/how-it-works" ||
    pathname === "/pricing" ||
    pathname === "/about";

  // Auth pages
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/onboarding");

  if (isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07060B] text-[#F5F3FF] selection:bg-[#8B5CF6]/30 selection:text-[#DDD6FE] relative overflow-x-hidden">
        <NeuralBackground opacity={0.35} nodeCount={38} />
        <CommandPalette />
        <PublicNavbar />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <PublicFooter />
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#07060B] text-[#F5F3FF] selection:bg-[#8B5CF6]/30 selection:text-[#DDD6FE] relative overflow-hidden">
        <NeuralBackground opacity={0.3} nodeCount={25} />
        <CommandPalette />
        {/* Ambient violet background glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#8B5CF6]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#6D28D9]/15 rounded-full blur-3xl pointer-events-none" />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">{children}</main>
      </div>
    );
  }

  // Authenticated workspace application layout
  return (
    <div className="min-h-screen flex bg-[#07060B] text-[#F5F3FF] selection:bg-[#8B5CF6]/30 selection:text-[#DDD6FE] antialiased relative">
      <NeuralBackground opacity={0.22} nodeCount={30} />
      <CommandPalette />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
