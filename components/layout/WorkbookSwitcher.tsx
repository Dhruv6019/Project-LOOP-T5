"use client";
// components/layout/WorkbookSwitcher.tsx
// Seamless Workbook / Multi-Tenant Workspace Switcher Dropdown

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus, Shield, Sparkles, Database } from "lucide-react";
import Link from "next/link";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    feedback: number;
    themes: number;
    reports: number;
  };
}

export function WorkbookSwitcher() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const json = await res.json();
        const list: WorkspaceItem[] = json.data || [];
        setWorkspaces(list);

        const currentActiveId = json.activeWorkspaceId || session?.user?.workspaceId;
        const current = list.find((w) => w.id === currentActiveId) || json.activeWorkspace || list[0] || null;
        setActiveWorkspace(current);
      }
    } catch (err) {
      console.error("Failed to fetch workbooks for switcher:", err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [session?.user?.workspaceId]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitch = async (workspace: WorkspaceItem) => {
    if (workspace.id === activeWorkspace?.id) {
      setIsOpen(false);
      return;
    }

    if (!isAdmin) {
      setIsOpen(false);
      return;
    }

    try {
      setLoadingId(workspace.id);
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        setActiveWorkspace(workspace);
        setIsOpen(false);
        if (updateSession) {
          await updateSession({ workspaceId: workspace.id });
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch workbook:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="relative px-3 py-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all text-left group shadow-2xs cursor-pointer"
        title="Switch Workbook / Workspace"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[10px]">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                Workbook
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate leading-tight mt-0.5 group-hover:text-indigo-600 transition-colors">
              {activeWorkspace?.name || "Active Workbook"}
            </p>
          </div>
        </div>

        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-scale-in">
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-100">
            <span>Switch Workbook</span>
            <span className="text-indigo-600 font-bold font-mono">{workspaces.length} Total</span>
          </div>

          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
            {workspaces.map((ws) => {
              const isCurrent = ws.id === (activeWorkspace?.id || session?.user?.workspaceId);
              const isLoading = loadingId === ws.id;

              return (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors text-xs ${
                    isCurrent
                      ? "bg-indigo-50/80 text-indigo-950 font-bold"
                      : "hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs leading-none">{ws.name}</p>
                      {ws._count && (
                        <p className="text-[10px] text-slate-400 font-normal leading-none mt-1">
                          {ws._count.feedback} signals • {ws._count.themes} themes
                        </p>
                      )}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0 ml-2" />
                  ) : isCurrent ? (
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Admin shortcuts in dropdown */}
          {isAdmin && (
            <div className="pt-1.5 border-t border-slate-100 space-y-1">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/60 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Manage Workbooks</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
