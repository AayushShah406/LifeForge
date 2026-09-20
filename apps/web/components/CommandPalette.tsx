'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Play,
  ShieldCheck,
  Brain,
  Wrench,
  Activity,
  Award,
  Layers,
  Settings,
  ArrowRight,
  Command,
  FileText
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Workflow' | 'Agent System' | 'Knowledge' | 'Security';
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  badge?: string;
  hotkey?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    {
      id: 'cmd-goal',
      title: 'Launch Autonomous Goal',
      description: 'Convert natural language goal into verified multi-step workflow',
      category: 'Workflow',
      icon: Sparkles,
      href: '/command-center',
      hotkey: 'G',
    },
    {
      id: 'cmd-workflows',
      title: 'View Active Workflows',
      description: 'Inspect running LangGraph state machines and agent trajectories',
      category: 'Workflow',
      icon: Play,
      href: '/workflows',
      hotkey: 'W',
    },
    {
      id: 'cmd-approvals',
      title: 'Human-in-the-Loop Approvals',
      description: 'Review sensitive actions awaiting cryptographic or manual clearance',
      category: 'Security',
      icon: ShieldCheck,
      href: '/approvals',
      hotkey: 'A',
      badge: 'HITL',
    },
    {
      id: 'cmd-knowledge',
      title: 'Semantic Memory & RAG Knowledge',
      description: 'Explore neural vectors, personal embeddings and indexed documents',
      category: 'Knowledge',
      icon: Brain,
      href: '/knowledge',
      hotkey: 'K',
    },
    {
      id: 'cmd-tools',
      title: 'MCP Tools & Registry',
      description: 'Inspect Model Context Protocol servers and live capabilities',
      category: 'Agent System',
      icon: Wrench,
      href: '/tools',
      hotkey: 'T',
    },
    {
      id: 'cmd-observability',
      title: 'Agent Trajectories & Telemetry',
      description: 'LangSmith token latency, reasoning traces, and audit logs',
      category: 'Agent System',
      icon: Activity,
      href: '/observability',
      hotkey: 'O',
    },
    {
      id: 'cmd-eval',
      title: 'Autonomous Evaluation Suites',
      description: 'Benchmark plan adherence, safety guardrails, and verification rates',
      category: 'Agent System',
      icon: Award,
      href: '/evaluation',
      hotkey: 'E',
    },
    {
      id: 'cmd-integrations',
      title: 'Connected Platforms & APIs',
      description: 'Manage GitHub, Google Calendar, Slack, and Linear connectors',
      category: 'Agent System',
      icon: Layers,
      href: '/integrations',
    },
    {
      id: 'cmd-settings',
      title: 'Platform Configuration',
      description: 'Manage model routing, Gemini 3 tokens, and verification policies',
      category: 'Security',
      icon: Settings,
      href: '/settings',
    }
  ];

  const filteredItems = commandItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    }
  };

  const executeItem = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#07060B]/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0C0A12] border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.25)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[rgba(139,92,246,0.15)] bg-[#12101A]/70">
          <Search className="w-5 h-5 text-[#A78BFA] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command, navigation, or search..."
            className="w-full bg-transparent text-sm sm:text-base text-[#F5F3FF] placeholder-[#8C82A2] focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-[#A78BFA] bg-[#181421] border border-[rgba(139,92,246,0.25)] rounded">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[rgba(255,255,255,0.03)] custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#8C82A2] text-sm">
              No matching commands or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-[rgba(139,92,246,0.16)] border border-[rgba(139,92,246,0.35)] shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border border-transparent hover:bg-[rgba(139,92,246,0.06)]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                          : 'bg-[#181421] text-[#A78BFA] border border-[rgba(139,92,246,0.2)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium truncate ${isSelected ? 'text-[#F5F3FF]' : 'text-[#DDD6FE]'}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.2)] text-[#FBBF24] border border-[rgba(245,158,11,0.3)]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8C82A2] truncate">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-3 shrink-0">
                    <span className="text-[10px] text-[#A78BFA]/70 uppercase font-mono tracking-wider hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-[#A78BFA] animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-[#07060B] border-t border-[rgba(139,92,246,0.15)] flex items-center justify-between text-xs text-[#8C82A2]">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#181421] border border-[rgba(139,92,246,0.2)] text-[10px] text-[#A78BFA]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#181421] border border-[rgba(139,92,246,0.2)] text-[10px] text-[#A78BFA]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="flex items-center space-x-1 text-[#A78BFA]">
            <Sparkles className="w-3 h-3 text-[#A78BFA]" />
            <span className="font-mono text-[11px]">LifeForge OS v2.0</span>
          </span>
        </div>
      </div>
    </div>
  );
}
