"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Brain,
  Download,
  Trash2,
  Users,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  UserX,
  UserCheck,
  ChevronRight,
  Database,
  Plus,
  Building,
  Check,
  X,
  Layers,
  Archive
} from "lucide-react";

interface AdminData {
  workspace: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  };
  counts: {
    totalFeedback: number;
    classifiedFeedback: number;
    unclassifiedCount: number;
    embeddedFeedback: number;
    unembeddedCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    totalThemes: number;
    totalReports: number;
    totalChatSessions: number;
    totalUsers: number;
  };
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentActivity: {
    recentFeedback: Array<{
      id: string;
      content: string;
      channel: string;
      sentiment: string | null;
      createdAt: string;
    }>;
    recentReports: Array<{
      id: string;
      title: string;
      createdAt: string;
      generatedBy: { name: string | null; email: string };
    }>;
  };
  pipeline: {
    database: { status: string; latencyMs: number };
    claudeNlp: { status: string; model: string };
    voyageEmbeddings: { status: string; model: string };
  };
}

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: {
    users: number;
    feedback: number;
    themes: number;
    reports: number;
  };
}

export default function AdminPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AdminData | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [showCreateWorkbookModal, setShowCreateWorkbookModal] = useState(false);
  const [newWorkbookName, setNewWorkbookName] = useState("");
  const [seedDemoData, setSeedDemoData] = useState(true);
  const [createWorkbookLoading, setCreateWorkbookLoading] = useState(false);

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeFilter, setPurgeFilter] = useState<"unclassified" | "all">("unclassified");

  // Load Admin Data & Workspaces
  const loadAdminMetrics = async () => {
    try {
      setLoading(true);
      const ts = Date.now(); // cache-bust
      const [resMetrics, resWs] = await Promise.all([
        fetch(`/api/admin/metrics?ts=${ts}`, { cache: "no-store" }),
        fetch(`/api/workspaces?ts=${ts}`, { cache: "no-store" }),
      ]);

      if (resMetrics.status === 403 || resWs.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (resMetrics.ok) {
        const json = await resMetrics.json();
        setData(json.data);
      }

      if (resWs.ok) {
        const jsonWs = await resWs.json();
        setWorkspaces(jsonWs.data || []);
        // Use live activeWorkspaceId from DB (requireAuth always does fresh DB lookup)
        setActiveWorkspaceId(jsonWs.activeWorkspaceId || "");
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Execute Admin Action
  const handleAction = async (action: string, payload?: any) => {
    try {
      setActionLoading(action);
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      const resJson = await res.json();

      if (!res.ok) {
        notify("error", resJson.error || "Action failed to execute");
        return;
      }

      if (action === "export_data") {
        const blob = new Blob([JSON.stringify(resJson.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project-loop-export-${data?.workspace.slug || "workspace"}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify("success", "Workspace dataset downloaded successfully!");
      } else {
        notify("success", resJson.message || "Operation completed successfully!");
        await loadAdminMetrics();
      }
    } catch (err: any) {
      notify("error", err?.message || "An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // Create New Workbook / Workspace
  const handleCreateWorkbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkbookName.trim()) return;

    setCreateWorkbookLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkbookName.trim(),
          seedDemoData,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        notify("error", resJson.error || "Failed to create workbook");
        return;
      }

      if (updateSession && resJson.data?.id) {
        await updateSession({ workspaceId: resJson.data.id });
      } else if (updateSession) {
        await updateSession();
      }

      // Hard reload so sidebar workbook name updates immediately
      window.location.href = "/admin";
    } catch (err: any) {
      notify("error", err?.message || "An unexpected error occurred");
    } finally {
      setCreateWorkbookLoading(false);
    }
  };

  // Switch Active Workbook
  const handleSwitchWorkbook = async (workspaceId: string) => {
    try {
      setActionLoading(`switch-${workspaceId}`);
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        cache: "no-store",
      });

      const resJson = await res.json();
      if (!res.ok) {
        notify("error", resJson.error || "Failed to switch workbook");
        return;
      }

      // Immediately update local state so UI reflects switch without waiting for reload
      setActiveWorkspaceId(workspaceId);

      if (updateSession) {
        await updateSession({ workspaceId });
      }

      // Hard navigate to reload all server-side data fresh
      window.location.href = "/admin";
    } catch (err: any) {
      notify("error", err?.message || "An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Past Workbook
  const handleDeleteWorkbook = async (workspaceId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently DELETE workbook "${name}" and all its customer feedback, themes, and reports from the database? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(`delete-${workspaceId}`);
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      const resJson = await res.json();
      if (!res.ok) {
        notify("error", resJson.error || "Failed to delete workbook");
        return;
      }

      notify("success", resJson.message || "Workbook deleted permanently!");
      if (updateSession) {
        await updateSession();
      }
      await loadAdminMetrics();
      router.refresh();
    } catch (err: any) {
      notify("error", err?.message || "An unexpected error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const role = session?.user?.role;
  if (role && role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          You must be an <strong>ADMIN</strong> of this workspace to access the Admin Control Center.
        </p>
        <Link href="/dashboard" className="inline-block px-4 py-2 bg-slate-950 text-white rounded-full text-xs font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SUPERADMIN ACCESS CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Workspace & Workbook Control Center
            </h1>
            <p className="text-xs text-indigo-200/80 max-w-xl leading-relaxed">
              Global orchestrator for <strong>{data?.workspace?.name || "Your Workspace"}</strong>. Manage multi-tenant workbooks, batch AI inference, vector indexes, and database records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateWorkbookModal(true)}
              className="bg-white text-slate-950 hover:bg-slate-100 rounded-full text-xs font-bold shadow-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Workbook
            </Button>

            <button
              onClick={loadAdminMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fade-in shadow-md ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. PIPELINE TELEMETRY HEALTH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">PostgreSQL Pool</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Latency ~{data?.pipeline.database.latencyMs || 18}ms • Connected</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Claude 3.5 Sonnet</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">NLP Classification Engine</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Voyage AI Vectors</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">1024-dim Copilot Embeddings</p>
          </div>
        </div>
      </div>

      {/* 2. SUPERPOWER ACTION TRIGGERS (CONNECTED TO DATABASE) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-slate-950 tracking-tight">
            Administrative Superpowers & Batch Automations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Trigger on-demand pipeline tasks and data operations across your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1: Batch AI Classification */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Batch AI Classification</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Run Claude NLP on {data?.counts.unclassifiedCount || 0} unclassified signals in background.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => handleAction("reclassify_all", { forceAll: false })}
                loading={actionLoading === "reclassify_all"}
                className="w-full text-xs font-bold py-2 rounded-xl"
              >
                Run Batch AI
              </Button>
              <button
                onClick={() => handleAction("reclassify_all", { forceAll: true })}
                disabled={actionLoading === "reclassify_all"}
                className="w-full text-[10px] text-indigo-600 hover:text-indigo-800 font-bold transition-colors text-center"
              >
                Force Re-classify All Signals
              </button>
            </div>
          </div>

          {/* Action 2: Vector Re-Indexing */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Vector Re-Indexing</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Generate Voyage AI embeddings for {data?.counts.unembeddedCount || 0} missing vectors.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => handleAction("reindex_embeddings", { forceAll: false })}
                loading={actionLoading === "reindex_embeddings"}
                variant="outline"
                className="w-full text-xs font-bold py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border-sky-200"
              >
                Re-Index Vectors
              </Button>
              <button
                onClick={() => handleAction("reindex_embeddings", { forceAll: true })}
                disabled={actionLoading === "reindex_embeddings"}
                className="w-full text-[10px] text-sky-600 hover:text-sky-800 font-bold transition-colors text-center"
              >
                Re-embed All Items
              </button>
            </div>
          </div>

          {/* Action 3: Export Dataset */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Export Full Archive</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download a JSON dump containing all signals, metadata, and themes.
              </p>
            </div>
            <Button
              onClick={() => handleAction("export_data")}
              loading={actionLoading === "export_data"}
              variant="outline"
              className="w-full text-xs font-bold py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              Download JSON
            </Button>
          </div>

          {/* Action 4: Purge Signals */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-rose-300 transition-all">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Purge Signals</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Clean up unclassified or test items from database.
              </p>
            </div>
            <Button
              onClick={() => setShowPurgeModal(true)}
              variant="outline"
              className="w-full text-xs font-bold py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border-rose-200"
            >
              Purge Options
            </Button>
          </div>

        </div>
      </div>

      {/* 3. MULTI-TENANT WORKBOOKS MANAGER (ADD NEW & DELETE PAST) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-950 tracking-tight">
              Workbooks & Multi-Tenant Workspaces
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create new workbooks for different product lines, or switch and delete past workbooks (Admin Only).
            </p>
          </div>
          <Button
            onClick={() => setShowCreateWorkbookModal(true)}
            id="add-workbook-btn"
            className="rounded-full px-5 py-2 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New Workbook
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            // Use activeWorkspaceId state — sourced from live DB via requireAuth()
            const isActive = ws.id === activeWorkspaceId;

            return (
              <div
                key={ws.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isActive
                    ? "bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                        <Building className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-950 leading-none">{ws.name}</h4>
                        <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">{ws.slug}</span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-600 text-white uppercase">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px]">
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Signals</span>
                      <strong className="text-slate-900 font-bold text-xs">{ws._count?.feedback ?? 0}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Themes</span>
                      <strong className="text-slate-900 font-bold text-xs">{ws._count?.themes ?? 0}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-semibold">Reports</span>
                      <strong className="text-slate-900 font-bold text-xs">{ws._count?.reports ?? 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  {!isActive ? (
                    <Button
                      onClick={() => handleSwitchWorkbook(ws.id)}
                      loading={actionLoading === `switch-${ws.id}`}
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold py-1.5 rounded-xl bg-white flex-1"
                    >
                      Switch to this Workbook
                    </Button>
                  ) : (
                    <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-600" /> Currently Active
                    </span>
                  )}

                  {workspaces.length > 1 && (
                    <button
                      onClick={() => handleDeleteWorkbook(ws.id, ws.name)}
                      disabled={actionLoading === `delete-${ws.id}`}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Delete past workbook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TEAM MEMBER PRIVILEGE MATRIX */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-950 tracking-tight">
              Team Member Access & Roles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly promote, demote, or manage privileges for all members in this workspace.
            </p>
          </div>
          <Link
            href="/settings/members"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span>Invite New Members</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Role Switcher</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name || "User"}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : user.role === "ANALYST"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleAction("update_role", {
                          userId: user.id,
                          newRole: e.target.value,
                        })
                      }
                      disabled={actionLoading === "update_role"}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {user.id !== session?.user?.id && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${user.email} from the workspace?`)) {
                            handleAction("delete_user", { userId: user.id });
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="Remove member"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW WORKBOOK MODAL */}
      {showCreateWorkbookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Add New Workbook</h3>
                  <p className="text-[11px] text-slate-500">Create a dedicated workspace tenant</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateWorkbookModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkbook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Workbook / Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Product VoC"
                  value={newWorkbookName}
                  onChange={(e) => setNewWorkbookName(e.target.value)}
                  className="input-base text-xs h-11"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Pre-seed Starter Feedback</span>
                  <span className="text-[11px] text-slate-500">Includes starter VoC signals and themes</span>
                </div>
                <input
                  type="checkbox"
                  checked={seedDemoData}
                  onChange={(e) => setSeedDemoData(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateWorkbookModal(false)}
                  type="button"
                  size="sm"
                  className="rounded-full text-xs font-bold px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createWorkbookLoading}
                  size="sm"
                  className="rounded-full text-xs font-bold px-6"
                >
                  Create Workbook
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURGE FEEDBACK MODAL */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Purge Signals</h3>
                  <p className="text-[11px] text-slate-500">Select deletion scope for this workspace</p>
                </div>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setPurgeFilter("unclassified")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  purgeFilter === "unclassified" ? "bg-rose-50 border-rose-300 ring-1 ring-rose-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="purge_scope"
                  checked={purgeFilter === "unclassified"}
                  onChange={() => setPurgeFilter("unclassified")}
                  className="text-rose-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Purge Unclassified Signals Only</p>
                  <p className="text-[11px] text-slate-500">Removes records with zero sentiment analysis.</p>
                </div>
              </label>

              <label
                onClick={() => setPurgeFilter("all")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  purgeFilter === "all" ? "bg-rose-50 border-rose-300 ring-1 ring-rose-300" : "bg-slate-50 border-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="purge_scope"
                  checked={purgeFilter === "all"}
                  onChange={() => setPurgeFilter("all")}
                  className="text-rose-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Purge ALL Feedback in Workspace</p>
                  <p className="text-[11px] text-slate-500">Resets feedback inbox completely.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowPurgeModal(false)}
                type="button"
                size="sm"
                className="rounded-full text-xs font-bold px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleAction("purge_feedback", { filter: purgeFilter });
                  setShowPurgeModal(false);
                }}
                loading={actionLoading === "purge_feedback"}
                size="sm"
                className="rounded-full text-xs font-bold px-6 bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Purge
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
