"use client";
// components/layout/Topbar.tsx
// Luxury Topbar with Quick Search Action trigger and page context

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CommandPalette } from "./CommandPalette";

import Link from "next/link";
import { useSession } from "next-auth/react";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Real-time customer feedback analytics & metrics" },
  "/inbox": { title: "Feedback Inbox", subtitle: "Filter, search, and action customer signals" },
  "/ingest": { title: "Add Feedback", subtitle: "Ingest single items, bulk CSV, or live sync channels" },
  "/themes": { title: "Themes & Trends", subtitle: "AI-clustered topics with growth spike detection" },
  "/ask": { title: "Ask LOOP", subtitle: "AI-grounded semantic search across customer feedback" },
  "/reports": { title: "VoC Reports", subtitle: "Executive Voice-of-Customer decision summaries" },
  "/admin": { title: "Workspace Admin Console", subtitle: "Superpower controls, telemetry, batch AI automations & security" },
  "/settings": { title: "Settings & Profile", subtitle: "Workspace configuration, profile, and team governance" },
  "/settings/members": { title: "Team Members", subtitle: "Manage workspace roles and member access" },
};

interface TopbarProps {
  children?: React.ReactNode;
}

export function Topbar({ children }: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageInfo = Object.entries(PAGE_TITLES)
    .filter(([key]) => pathname === key || pathname.startsWith(key + "/"))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? {
    title: "LOOP",
    subtitle: "",
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
  };

  const userInitial = (session?.user?.name || session?.user?.email || "U")[0]?.toUpperCase();

  return (
    <>
      <CommandPalette />
      <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-extrabold text-slate-950 leading-none">{pageInfo.title}</h2>
          {pageInfo.subtitle && (
            <p className="text-xs text-slate-400 font-medium leading-none mt-1 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Universal Quick Search Action */}
          <button
            onClick={triggerCommandPalette}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80 rounded-xl transition-all cursor-pointer shadow-2xs font-medium"
            title="Quick Action search"
          >
            <span>🔍</span>
            <span className="hidden md:inline">Quick Action</span>
          </button>

          {/* Quick Edit Profile Pill */}
          <Link
            href="/settings"
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all text-xs font-semibold text-slate-700 shadow-2xs group"
            title="Edit Profile"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 via-indigo-500 to-indigo-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
              {userInitial}
            </div>
            <span className="hidden sm:inline group-hover:text-indigo-600 transition-colors">
              Edit Profile
            </span>
          </Link>

          {children}
        </div>
      </header>
    </>
  );
}
