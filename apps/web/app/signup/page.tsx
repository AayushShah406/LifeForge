"use client";

import Link from "next/link";
import { useState, useId } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Cpu,
  Bot,
  Activity
} from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password matching validation
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Empty", color: "bg-zinc-700" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
    if (score <= 3) return { score: 2, label: "Good", color: "bg-amber-500", text: "text-amber-400" };
    return { score: 3, label: "AI-Grade Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirm password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.message || "Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative">
      {/* Floating AI Micro-Badges for Futuristic Atmosphere */}
      <div className="hidden lg:flex items-center gap-2 absolute -top-10 -left-20 px-3 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.3)] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] text-[10px] font-mono text-[#DDD6FE] animate-ai-float pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#8B5CF6] neural-pulse-dot" />
        <Cpu className="w-3.5 h-3.5 text-[#A78BFA]" />
        <span>Gemini 3.1 Pro Engine Ready</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute -bottom-8 -right-20 px-3 py-1.5 rounded-xl bg-[#0C0A12]/90 border border-[rgba(139,92,246,0.3)] backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] text-[10px] font-mono text-[#DDD6FE] animate-ai-float-delayed pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#34D399] neural-pulse-dot" />
        <Bot className="w-3.5 h-3.5 text-[#34D399]" />
        <span>LangGraph Multi-Agent Cluster</span>
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-2xl text-[#F5F3FF] tracking-tight">LifeForge</span>
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight">Create your LifeForge workspace</h1>
        
        {/* Animated AI Telemetry Pulse Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#C4B5FD] font-mono">
          <Activity className="w-3 h-3 text-[#A78BFA] animate-pulse" />
          <span>AI Identity Synthesizer: Standby</span>
        </div>
      </div>

      {/* Card with AI Border Beam Animation */}
      <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.35)] bg-[#0C0A12]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.2)] space-y-5 ai-border-beam relative">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="signup-name-input" className="text-xs font-medium text-[#DDD6FE]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>
          </div>

          {/* Work Email */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email-input" className="text-xs font-medium text-[#DDD6FE]">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="signup-password-input" className="text-xs font-medium text-[#DDD6FE]">Password</label>
              {password.length > 0 && (
                <span className={`text-[10px] font-mono font-medium ${strength.text}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signup-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

            {/* Password strength visual bar */}
            {password.length > 0 && (
              <div className="grid grid-cols-3 gap-1 pt-1">
                <div className={`h-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-zinc-800"}`} />
                <div className={`h-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-zinc-800"}`} />
                <div className={`h-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-zinc-800"}`} />
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="signup-confirm-password-input" className="text-xs font-medium text-[#DDD6FE]">Confirm Password</label>
              {passwordsMatch && (
                <span id="password-match-badge" className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Passwords match</span>
                </span>
              )}
              {passwordsMismatch && (
                <span id="password-mismatch-badge" className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-400 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                passwordsMatch ? "text-emerald-400" : passwordsMismatch ? "text-rose-400" : "text-[#8C82A2]"
              }`} />
              <input
                id="signup-confirm-password-input"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full bg-[#12101A] border rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none transition-all ${
                  passwordsMatch
                    ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : passwordsMismatch
                    ? "border-rose-500/60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : "border-[rgba(139,92,246,0.25)] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C82A2] hover:text-[#DDD6FE] transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AI Provisioning Pill */}
          <div className="p-3 rounded-xl bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] text-[11px] text-[#DDD6FE] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
            <span>Includes 50 free workflow runs with Gemini 3 routing, LangGraph state machine, and Weaviate RAG memory.</span>
          </div>

          {/* Submit Button with Animated Shimmer */}
          <button
            id="signup-submit-button"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Agent Workspace...</span>
              </>
            ) : (
              <>
                <span>Continue to Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#8C82A2]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#A78BFA] hover:text-[#C4B5FD] font-medium underline underline-offset-4 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8C82A2]">
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
          Instant provisioning. No credit card required.
        </span>
      </div>
    </div>
  );
}
