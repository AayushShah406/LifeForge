"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Zap, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "demo_token";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update password");
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-2xl text-[#F5F3FF] tracking-tight">LifeForge</span>
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight">Set new password</h1>
        <p className="text-xs text-[#8C82A2]">Choose a secure password for your account</p>
      </div>

      <div className="p-8 rounded-2xl border border-[rgba(139,92,246,0.3)] bg-[#0C0A12]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.18)] space-y-6">
        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Password Updated</h3>
            <p className="text-xs text-[#A197B4]">
              Your credentials have been securely updated. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#DDD6FE]">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#DDD6FE]">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C82A2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full bg-[#12101A] border border-[rgba(139,92,246,0.25)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-semibold text-xs shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-[#DDD6FE] text-xs">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
