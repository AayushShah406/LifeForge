"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token") || "session_callback_token";
    if (token) {
      localStorage.setItem("lifeforge_token", token);
      // Small timeout to allow state hydration
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/25 animate-pulse">
        <Zap className="w-6 h-6 text-white fill-white" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">Authenticating with LifeForge...</h3>
        <p className="text-xs text-slate-400">Verifying security credentials and configuring workspace</p>
      </div>
      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-white text-xs">Authenticating...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
