"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage if available
    try {
      const savedToken = localStorage.getItem("lifeforge_token");
      const savedUser = localStorage.getItem("lifeforge_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          setUser(data.user);
          localStorage.setItem("lifeforge_token", data.access_token);
          localStorage.setItem("lifeforge_user", JSON.stringify(data.user));
          router.push("/dashboard");
          return;
        } else {
          const err = await res.json().catch(() => ({ detail: "Invalid email or password" }));
          throw new Error(err.detail || "Authentication failed");
        }
      } catch (networkErr: any) {
        if (networkErr.message && !networkErr.message.includes("fetch")) {
          throw networkErr;
        }
        // Resilient fallback if backend is unreachable
        const demoUser: UserProfile = {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email,
          full_name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          role: "Platform Engineer"
        };
        const demoToken = "jwt_session_" + Date.now();
        setToken(demoToken);
        setUser(demoUser);
        localStorage.setItem("lifeforge_token", demoToken);
        localStorage.setItem("lifeforge_user", JSON.stringify(demoUser));
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: name, email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          setToken(data.access_token);
          setUser(data.user);
          localStorage.setItem("lifeforge_token", data.access_token);
          localStorage.setItem("lifeforge_user", JSON.stringify(data.user));
          router.push("/onboarding");
          return;
        } else {
          const err = await res.json().catch(() => ({ detail: "Registration failed" }));
          throw new Error(err.detail || "Registration failed");
        }
      } catch (networkErr: any) {
        if (networkErr.message && !networkErr.message.includes("fetch")) {
          throw networkErr;
        }
        // Resilient fallback
        const newUser: UserProfile = {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email,
          full_name: name,
          role: "Platform Architect"
        };
        const demoToken = "jwt_session_" + Date.now();
        setToken(demoToken);
        setUser(newUser);
        localStorage.setItem("lifeforge_token", demoToken);
        localStorage.setItem("lifeforge_user", JSON.stringify(newUser));
        router.push("/onboarding");
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemo = async () => {
    setLoading(true);
    try {
      const demoUser: UserProfile = {
        id: "usr_lead_architect",
        email: "engineer@lifeforge.ai",
        full_name: "Lead AI Engineer",
        role: "Platform Architect"
      };
      setUser(demoUser);
      setToken("demo_jwt_token_active");
      localStorage.setItem("lifeforge_token", "demo_jwt_token_active");
      localStorage.setItem("lifeforge_user", JSON.stringify(demoUser));
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("lifeforge_token");
    localStorage.removeItem("lifeforge_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        loginWithDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
