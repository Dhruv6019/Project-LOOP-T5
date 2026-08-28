"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  User,
  Building,
  Users,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Inbox,
  Lock,
  Mail,
  Edit3,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "workspace">("profile");

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Workspace Form States
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [workspaceStats, setWorkspaceStats] = useState<{
    users: number;
    feedback: number;
    themes: number;
  }>({ users: 0, feedback: 0, themes: 0 });
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceSuccess, setWorkspaceSuccess] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Fetch real data from database on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setName(json.data.name || "");
            setEmail(json.data.email || "");
            if (json.data.createdAt) {
              setCreatedAt(
                new Date(json.data.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              );
            }
            if (json.data.workspace) {
              setWorkspaceName(json.data.workspace.name || "");
              setWorkspaceSlug(json.data.workspace.slug || "");
              if (json.data.workspace._count) {
                setWorkspaceStats(json.data.workspace._count);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }

    fetchUserData();
  }, []);

  // Handle Profile Update (Name, Email, Password)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setProfileError("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileError("New password must be at least 6 characters");
      return;
    }

    if (newPassword && !currentPassword) {
      setProfileError("Please enter your current password to authorize this change");
      return;
    }

    setProfileLoading(true);

    try {
      const payload: any = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile");
        setProfileLoading(false);
        return;
      }

      setProfileSuccess("Profile changes saved to database successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh session
      if (updateSession) {
        await updateSession();
      }

      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err?.message || "An unexpected error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Workspace Name Update (Admin only)
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkspaceError("");
    setWorkspaceSuccess("");
    setWorkspaceLoading(true);

    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setWorkspaceError(data.error || "Failed to update workspace");
        setWorkspaceLoading(false);
        return;
      }

      setWorkspaceSuccess("Workspace settings updated successfully!");
      setTimeout(() => setWorkspaceSuccess(""), 4000);
    } catch (err: any) {
      setWorkspaceError(err?.message || "An unexpected error occurred");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const copyWorkspaceId = () => {
    const id = session?.user?.workspaceId || "";
    if (id) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const role = session?.user?.role || "VIEWER";
  const userInitials = (name || session?.user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-4 ring-slate-50 shrink-0">
              {userInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Active">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {name || "My Account"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span>{email || session?.user?.email}</span>
              {createdAt && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Joined {createdAt}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Workspace Quick Tag */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 self-start sm:self-auto">
          <Building className="w-4 h-4 text-indigo-600" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Workspace</span>
            <span className="text-xs font-bold text-slate-900 leading-tight">{workspaceName || "Default Workspace"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          
          {/* Tab 1: Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left border ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/40 shadow-lg ring-1 ring-white/10 scale-[1.01]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              activeTab === "profile" ? "bg-indigo-500/30 text-indigo-300" : "bg-slate-100 text-slate-600"
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-extrabold leading-none ${activeTab === "profile" ? "text-white" : "text-slate-950"}`}>
                My Profile
              </p>
              <p className={`text-xs font-medium mt-1.5 truncate ${activeTab === "profile" ? "text-indigo-200" : "text-slate-500"}`}>
                Name, email, and password
              </p>
            </div>
          </button>

          {/* Tab 2: Workspace */}
          <button
            onClick={() => setActiveTab("workspace")}
            className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left border ${
              activeTab === "workspace"
                ? "bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/40 shadow-lg ring-1 ring-white/10 scale-[1.01]"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              activeTab === "workspace" ? "bg-indigo-500/30 text-indigo-300" : "bg-slate-100 text-slate-600"
            }`}>
              <Building className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-extrabold leading-none ${activeTab === "workspace" ? "text-white" : "text-slate-950"}`}>
                Workspace Settings
              </p>
              <p className={`text-xs font-medium mt-1.5 truncate ${activeTab === "workspace" ? "text-indigo-200" : "text-slate-500"}`}>
                Organization & database telemetry
              </p>
            </div>
          </button>

          {/* Tab 3: Team Link */}
          <Link
            href="/settings/members"
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-950 leading-none group-hover:text-indigo-600 transition-colors">
                  Team Members
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1.5 truncate">
                Manage invitations & roles
              </p>
            </div>
          </Link>

          {/* Security Guarantee Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-sky-50/50 border border-indigo-100 text-indigo-950 space-y-2 mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Multi-Tenant Data Isolation</span>
            </div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed font-normal">
              Profile details are securely encrypted and bound strictly to your tenant workspace boundary.
            </p>
          </div>
        </div>

        {/* Right Content Pane (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              
              {/* Profile Edit Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">Personal Information</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your account details and authentication credentials.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-3 animate-fade-in shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-3 animate-fade-in shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Name & Email Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          required
                          className="input-base pl-10 h-11 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          required
                          className="input-base pl-10 h-11 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-extrabold text-slate-950">Change Password</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          Current Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="input-base text-xs h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="input-base text-xs h-10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-600">
                          Confirm Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="input-base text-xs h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <Button
                      type="submit"
                      loading={profileLoading}
                      id="save-profile-btn"
                      className="px-7 py-3 rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all"
                    >
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>

              {/* Role Matrix */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Your Assigned Privileges
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Active: {role}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Feedback Ingestion</span>
                    <p className="text-xs font-bold text-slate-900">
                      {role === "VIEWER" ? "Read-Only Dashboard" : "Full Ingestion & CSV"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Theme Clustering</span>
                    <p className="text-xs font-bold text-slate-900">
                      {role === "VIEWER" ? "View Clusters" : "Manage & Trigger AI"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Workspace Governance</span>
                    <p className="text-xs font-bold text-slate-900">
                      {role === "ADMIN" ? "Admin Privileges" : "Member Privileges"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: WORKSPACE SETTINGS */}
          {activeTab === "workspace" && (
            <div className="space-y-6">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">Organization Profile</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure your workspace identifier and manage organization parameters.
                  </p>
                </div>

                {workspaceSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-3 animate-fade-in shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{workspaceSuccess}</span>
                  </div>
                )}

                {workspaceError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-3 animate-fade-in shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{workspaceError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveWorkspace} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      disabled={role !== "ADMIN"}
                      required
                      className={`input-base h-11 text-sm font-medium ${role !== "ADMIN" ? "bg-slate-50 cursor-not-allowed opacity-80" : ""}`}
                    />
                    {role !== "ADMIN" && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only workspace ADMINs can rename this organization.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Workspace ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled
                          value={session?.user?.workspaceId ?? "Loading..."}
                          className="input-base bg-slate-50 font-mono text-xs cursor-not-allowed text-slate-600 h-10"
                        />
                        <button
                          type="button"
                          onClick={copyWorkspaceId}
                          className="px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                          title="Copy Workspace ID"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{copiedId ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Workspace Slug
                      </label>
                      <input
                        type="text"
                        disabled
                        value={workspaceSlug || "default-workspace"}
                        className="input-base bg-slate-50 font-mono text-xs cursor-not-allowed text-slate-600 h-10"
                      />
                    </div>
                  </div>

                  {role === "ADMIN" && (
                    <div className="pt-3 flex justify-end border-t border-slate-100">
                      <Button
                        type="submit"
                        loading={workspaceLoading}
                        id="save-workspace-btn"
                        className="px-7 py-3 rounded-full font-bold text-xs"
                      >
                        Update Workspace
                      </Button>
                    </div>
                  )}
                </form>
              </div>

              {/* Database Telemetry Stats */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Database Resource Consumption
                </h4>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Team Members</span>
                    <p className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
                      {workspaceStats.users}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Signals Ingested</span>
                    <p className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
                      {workspaceStats.feedback}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Thematic Clusters</span>
                    <p className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
                      {workspaceStats.themes}
                    </p>
                  </div>
                </div>
              </div>

              {/* LIVE INGESTION WEBHOOK SUITE */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      <span>LIVE WEBHOOK INGESTION</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-950">
                      Connect Your Company's Real Apps & Live Data Sources
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xl">
                      Every company has different products, mobile apps, and support stacks. Pipe real feedback from your own Zendesk, Intercom, Slack, Shopify, or mobile app directly into this workspace.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    Your Workspace Ingestion Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/api/webhook/${workspaceSlug || "default"}` : `/api/webhook/${workspaceSlug || "default"}`}
                      className="input-base bg-slate-50 font-mono text-xs text-indigo-950 h-10 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(`${window.location.origin}/api/webhook/${workspaceSlug || "default"}`);
                          alert("Webhook URL copied to clipboard!");
                        }
                      }}
                      className="px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 overflow-x-auto">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-2">
                    <span>Example: Pipe Real Feedback via cURL / Webhook</span>
                    <span className="text-emerald-400">HTTP POST</span>
                  </div>
                  <pre className="text-slate-300 leading-relaxed">
{`curl -X POST "${typeof window !== "undefined" ? window.location.origin : "https://projectloop.vercel.app"}/api/webhook/${workspaceSlug || "default"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Customer reported payment gateway timeout during checkout on iOS build 3.1",
    "channel": "app_store",
    "customerLabel": "user_id_48210"
  }'`}
                  </pre>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
