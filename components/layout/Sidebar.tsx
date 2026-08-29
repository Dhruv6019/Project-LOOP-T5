"use client";
// components/layout/Sidebar.tsx
// Consistent Theme-Aligned Responsive Sidebar for Project LOOP

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import LoopLogo from "@/components/ui/LoopLogo";
import { useSidebar } from "@/components/layout/SidebarContext";
import { X } from "lucide-react";
import { WorkbookSwitcher } from "@/components/layout/WorkbookSwitcher";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
    label: "Dashboard",
  },
  {
    href: "/inbox",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    label: "Feedback Inbox",
  },
  {
    href: "/ingest",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    label: "Add Feedback",
    writerOnly: true,
  },
  {
    href: "/themes",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    label: "Themes & Trends",
  },
  {
    href: "/ask",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: "Ask LOOP",
  },
  {
    href: "/reports",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: "VoC Reports",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, closeSidebar } = useSidebar();
  const role = session?.user?.role;
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  const renderNavContent = () => (
    <>
      <div>
        {/* Brand Logo */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center gap-2 group">
            <LoopLogo size={26} className="text-slate-950 group-hover:text-indigo-600 transition-colors" />
            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 uppercase tracking-wider">
              {role ?? "APP"}
            </span>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workbook / Workspace Switcher */}
        <WorkbookSwitcher />

        {/* Navigation items */}
        <nav className="px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.writerOnly && role === "VIEWER") return null;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                id={`nav-${item.href.replace("/", "")}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none",
                  isActive
                    ? "bg-slate-950 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                )}
              >
                <div className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            {/* Admin-only Super Console link */}
            {role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={closeSidebar}
                id="nav-admin"
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none",
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-sm font-bold border border-indigo-500/30"
                    : "text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-950"
                )}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Console</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200/80 leading-none">
                  ADMIN
                </span>
              </Link>
            )}

            <Link
              href="/settings"
              onClick={closeSidebar}
              id="nav-settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 select-none",
                pathname.startsWith("/settings")
                  ? "bg-slate-950 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
              )}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* User footer with Edit Profile link */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100/90 shadow-2xs hover:border-slate-200 transition-all">
          <Link
            href="/settings"
            onClick={closeSidebar}
            className="flex items-center gap-2.5 flex-1 min-w-0 group"
            title="Edit Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-amber-500 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <span className="text-slate-950 text-xs font-bold">
                {userName[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-cursive text-amber-600 text-sm font-bold">Hello,</span>
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{userName}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{role}</p>
            </div>
          </Link>

          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              href="/settings"
              onClick={closeSidebar}
              title="Edit Profile"
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              id="sign-out-btn"
              title="Sign out"
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 h-screen sticky top-0 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex-col justify-between z-20">
        {renderNavContent()}
      </aside>

      {/* Mobile & Tablet Drawer Backdrop & Slide-out Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={closeSidebar}
          />
          {/* Drawer container */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl z-10 flex flex-col justify-between">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
}
