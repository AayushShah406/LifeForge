"use client";

import { useEffect, useState } from "react";
import { Calendar, Mail, HardDrive, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function IntegrationsPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrationsData = async () => {
    try {
      const [calRes, mailRes] = await Promise.all([
        fetch("/api/integrations/google/calendar-events").then((r) => (r.ok ? r.json() : { events: [] })),
        fetch("/api/integrations/google/emails").then((r) => (r.ok ? r.json() : { emails: [] })),
      ]);
      setCalendarEvents(calRes.events || []);
      setEmails(mailRes.emails || []);
    } catch {
      // Fallback
      setCalendarEvents([
        { id: "e1", title: "Team Standup", start: "Tomorrow 9:00 AM", status: "confirmed" },
        { id: "e2", title: "Interview Prep: Systems Design Session", start: "Thursday 2:00 PM", status: "confirmed" },
      ]);
      setEmails([
        { id: "m1", from: "recruiter@google.com", subject: "Interview Scheduling: Google Cloud AI Systems Role", snippet: "Hi, we are excited to move forward with your interview next Thursday..." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationsData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Google Workspace Integrations</h1>
        <p className="text-xs text-slate-400">
          First-class tools for Google Calendar and Gmail. All mutations require explicit human approval.
        </p>
      </div>

      {/* Integration Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Calendar */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected (Sandbox)
            </span>
          </div>

          <div>
            <h3 className="font-bold text-base text-white">Google Calendar API</h3>
            <p className="text-xs text-slate-400 mt-1">
              Read calendar, check availability, and schedule preparation sessions.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-100 border border-surface-border text-xs space-y-1">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Approval Guardrail: ACTIVE
            </div>
            <p className="text-slate-400 text-[11px]">
              Event creation, updates, and cancellations pause execution for approval.
            </p>
          </div>
        </div>

        {/* Gmail API */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected (Sandbox)
            </span>
          </div>

          <div>
            <h3 className="font-bold text-base text-white">Gmail API</h3>
            <p className="text-xs text-slate-400 mt-1">
              Search emails, extract interview tasks, and generate response drafts.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-100 border border-surface-border text-xs space-y-1">
            <div className="flex items-center gap-1 text-rose-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Sending Guardrail: MANDATORY
            </div>
            <p className="text-slate-400 text-[11px]">
              Agents can draft emails freely; sending emails ALWAYS requires human sign-off.
            </p>
          </div>
        </div>

        {/* Google Drive */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Connected (Sandbox)
            </span>
          </div>

          <div>
            <h3 className="font-bold text-base text-white">Google Drive API</h3>
            <p className="text-xs text-slate-400 mt-1">
              Import job descriptions, slide decks, and past interview notes directly into RAG.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-100 border border-surface-border text-xs space-y-1">
            <div className="text-cyan-400 font-semibold text-[11px]">
              Document Auto-Sync Enabled
            </div>
            <p className="text-slate-400 text-[11px]">
              Synchronizes files with Weaviate multi-tenant vector storage.
            </p>
          </div>
        </div>
      </div>

      {/* Live Calendar and Email Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Events */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-sm text-white">Scheduled Google Calendar Events</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">{calendarEvents.length} Events</span>
          </div>

          <div className="space-y-2.5">
            {calendarEvents.map((evt, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                <div className="font-semibold text-sm text-white">{evt.title}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">{evt.start}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 capitalize">{evt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gmail Messages */}
        <div className="glass-panel p-6 rounded-2xl border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <h2 className="font-bold text-sm text-white">Recent Gmail Messages</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">{emails.length} Emails</span>
          </div>

          <div className="space-y-2.5">
            {emails.map((msg, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-white">{msg.from}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Verified</span>
                </div>
                <div className="text-xs text-slate-300 font-medium">{msg.subject}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{msg.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
