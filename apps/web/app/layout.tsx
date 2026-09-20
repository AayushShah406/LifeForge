import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "LifeForge — Turn goals into verified actions",
  description:
    "Production-oriented agentic AI personal operations platform powered by Gemini 3 and LangGraph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#07060B] text-[#F5F3FF] min-h-screen antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
