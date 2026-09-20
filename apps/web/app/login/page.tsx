"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Cpu,
  ShieldAlert,
  Activity,
  Terminal
} from "lucide-react";

export default function LoginPage() {
  const { login, loginWithDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithDemo();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative">
      {/* Floating AI Micro-Badges */}
      <div className="hidden lg:flex items-center gap-2 absolute -top-10 -left-20 px-3 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.3)] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] text-[10px] font-mono text-[#DDD6FE] animate-ai-float pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#8B5CF6] neural-pulse-dot" />
        <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
        <span>Supervisor Agent Online</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute -bottom-8 -right-20 px-3 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.3)] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] text-[10px] font-mono text-[#DDD6FE] animate-ai-float-delayed pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] neural-pulse-dot" />
        <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>Dual-Gate HITL Guard Active</span>
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-2xl text-[#F5F3FF] tracking-tight">LifeForge</span>
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight">Sign in to your workspace</h1>
        
        {/* Animated AI Telemetry Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#C4B5FD] font-mono">
          <Activity className="w-3 h-3 text-[#A78BFA] animate-pulse" />
          <span>AI Operations Node: Authenticating Gateway</span>
        </div>
      </div>

      {/* Card with AI Border Beam Animation */}
      <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.35)] bg-[#0C0A12]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.2)] space-y-6 ai-border-beam relative">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email-input" className="text-xs font-medium text-[#DDD6FE]">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password-input" className="text-xs font-medium text-[#DDD6FE]">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#A78BFA] hover:text-[#C4B5FD] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C82A2] hover:text-[#DDD6FE] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Agent Gateway...</span>
              </>
            ) : (
              <>
                <span>Sign In to LifeForge</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(139,92,246,0.2)]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0C0A12] px-2.5 text-[#8C82A2] font-mono">Autonomous Sandbox Access</span>
          </div>
        </div>

        {/* Quick Demo Login with Shimmer & AI Sparkle Animation */}
        <button
          id="login-demo-button"
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[rgba(139,92,246,0.12)] hover:bg-[rgba(139,92,246,0.22)] border border-[rgba(139,92,246,0.4)] hover:border-[#8B5CF6] text-[#DDD6FE] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] active:scale-[0.98] group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
          <span>1-Click Sign In as Demo Engineer</span>
        </button>

        <p className="text-center text-xs text-[#8C82A2]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#A78BFA] hover:text-[#C4B5FD] font-medium underline underline-offset-4 transition-colors">
            Create workspace
          </Link>
        </p>
      </div>

      {/* Trust pill */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8C82A2]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
          Dual-layer verification gates & LangSmith audit tracing enabled
        </span>
      </div>
    </div>
  );
}
