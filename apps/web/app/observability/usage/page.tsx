"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  DollarSign,
  ChevronLeft,
  Calendar,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { MetricCard } from "@/components/ui/MetricCard";

const TOKEN_USAGE_DATA = [
  { day: "Mon", pro: 14200, flash: 32000, lite: 8400 },
  { day: "Tue", pro: 18500, flash: 41000, lite: 12000 },
  { day: "Wed", pro: 12000, flash: 29000, lite: 7500 },
  { day: "Thu", pro: 24500, flash: 56000, lite: 16000 },
  { day: "Fri", pro: 28000, flash: 62000, lite: 18500 },
  { day: "Sat", pro: 9500, flash: 21000, lite: 4000 },
  { day: "Sun", pro: 16200, flash: 38000, lite: 11000 },
];

const COST_DATA = [
  { day: "Mon", cost: 0.042 },
  { day: "Tue", cost: 0.058 },
  { day: "Wed", cost: 0.039 },
  { day: "Thu", cost: 0.081 },
  { day: "Fri", cost: 0.094 },
  { day: "Sat", cost: 0.029 },
  { day: "Sun", cost: 0.051 },
];

export default function UsageAnalyticsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/observability"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Observability</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>GEMINI 3 TOKEN & COST ECONOMICS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Usage Analytics</h1>
          <p className="text-xs text-slate-400">
            Track token volume, latency trends, and compute expenditure by Gemini 3 model tier.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/[0.04] text-slate-300 border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Past 7 Days</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Weekly Tokens"
          value="418,800"
          subtitle="All Models Combined"
          icon={<Cpu className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          title="Weekly Expenditure"
          value="$0.394"
          subtitle="Google AI Studio Rate"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Pro Routing Share"
          value="29.3%"
          subtitle="Deep Planning Tasks"
          icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
        />
        <MetricCard
          title="Flash Ops Share"
          value="70.7%"
          subtitle="Tool Execution & RAG"
          icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Consumption by Model Tier */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-bold text-sm text-white">Daily Token Consumption by Model</h3>
            <span className="text-[10px] font-mono text-cyan-400">Tokens / Day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOKEN_USAGE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C121E",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="pro" name="Gemini 3.1 Pro" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flash" name="Gemini 3.8 Flash" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lite" name="Gemini 3.1 Lite" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Cost Accumulation */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="font-bold text-sm text-white">Daily Compute Cost (USD)</h3>
            <span className="text-[10px] font-mono text-emerald-400">Estimated USD</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COST_DATA}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0C121E",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(4)}`, "Cost"]}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#costGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Tier Pricing & Allocation Table */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0C121E]/90 backdrop-blur-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Gemini 3 Family Economics</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase text-slate-400">
                <th className="pb-3">Model</th>
                <th className="pb-3">Role In LifeForge</th>
                <th className="pb-3">Input Price / 1M</th>
                <th className="pb-3">Output Price / 1M</th>
                <th className="pb-3">Avg Step Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300 font-mono">
              <tr>
                <td className="py-3 font-bold text-cyan-400">gemini-3.1-pro-preview</td>
                <td className="py-3 font-sans text-slate-200">Planner & Verifier Agents</td>
                <td className="py-3">$1.25</td>
                <td className="py-3">$5.00</td>
                <td className="py-3 text-cyan-300">620ms</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-indigo-400">gemini-3.8-flash</td>
                <td className="py-3 font-sans text-slate-200">Tool Executor & Researcher Agents</td>
                <td className="py-3">$0.10</td>
                <td className="py-3">$0.40</td>
                <td className="py-3 text-indigo-300">240ms</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-purple-400">gemini-3.1-flash-lite</td>
                <td className="py-3 font-sans text-slate-200">Synthesizer & Metadata Tagger</td>
                <td className="py-3">$0.075</td>
                <td className="py-3">$0.30</td>
                <td className="py-3 text-purple-300">140ms</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-emerald-400">gemini-embedding-001</td>
                <td className="py-3 font-sans text-slate-200">Weaviate Cloud Dense Embeddings</td>
                <td className="py-3">$0.025</td>
                <td className="py-3">—</td>
                <td className="py-3 text-emerald-300">65ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
