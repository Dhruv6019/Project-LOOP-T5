"use client";
// components/layout/CommandPalette.tsx
// Global Universal Command Palette (Ctrl+K / Cmd+K) for instant navigation and quick AI actions

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "AI Copilot";
  icon: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut listener: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      id: "nav-dashboard",
      title: "Go to Analytics Dashboard",
      category: "Navigation",
      icon: "📊",
      shortcut: "G D",
      action: () => {
        router.push("/dashboard");
        setIsOpen(false);
      },
    },
    {
      id: "nav-inbox",
      title: "Go to Feedback Inbox",
      category: "Navigation",
      icon: "📥",
      shortcut: "G I",
      action: () => {
        router.push("/inbox");
        setIsOpen(false);
      },
    },
    {
      id: "nav-ingest",
      title: "Add / Ingest Customer Feedback",
      category: "Navigation",
      icon: "➕",
      shortcut: "G A",
      action: () => {
        router.push("/ingest");
        setIsOpen(false);
      },
    },
    {
      id: "nav-themes",
      title: "View Themes & Trend Spikes",
      category: "Navigation",
      icon: "🏷️",
      shortcut: "G T",
      action: () => {
        router.push("/themes");
        setIsOpen(false);
      },
    },
    {
      id: "nav-reports",
      title: "Voice-of-Customer Reports",
      category: "Navigation",
      icon: "📋",
      shortcut: "G R",
      action: () => {
        router.push("/reports");
        setIsOpen(false);
      },
    },
    {
      id: "nav-ask",
      title: "Ask LOOP AI Copilot",
      category: "AI Copilot",
      icon: "✨",
      shortcut: "G S",
      action: () => {
        router.push("/ask");
        setIsOpen(false);
      },
    },
    {
      id: "action-csv",
      title: "Upload Feedback CSV",
      category: "Actions",
      icon: "📁",
      action: () => {
        router.push("/ingest");
        setIsOpen(false);
      },
    },
    {
      id: "nav-members",
      title: "Manage Workspace Members",
      category: "Navigation",
      icon: "👥",
      action: () => {
        router.push("/settings/members");
        setIsOpen(false);
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-base text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Type a command or search (e.g. 'Dashboard', 'Ask AI', 'Ingest')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found
            </div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-violet-50/80 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{cmd.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-violet-900">
                      {cmd.title}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 group-hover:text-violet-600">
                      {cmd.category}
                    </div>
                  </div>
                </div>
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-100 group-hover:bg-violet-100 group-hover:text-violet-700 rounded-sm">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 bg-white border border-slate-200 rounded-sm text-[9px]">↑</kbd>
            <kbd className="px-1 bg-white border border-slate-200 rounded-sm text-[9px]">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1 bg-white border border-slate-200 rounded-sm text-[9px]">↵</kbd>
          </div>
          <span>Project LOOP Copilot</span>
        </div>
      </div>
    </div>
  );
}
