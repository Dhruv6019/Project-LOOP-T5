"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Role } from "@/types";
import {
  Users,
  User,
  Building,
  Mail,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Trash2,
  UserPlus,
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

export default function MembersPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("VIEWER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const json = await res.json();
      if (json.data) setMembers(json.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteError("");
    setInviteMessage("");
    setInviteUrl("");
    setInviteLoading(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        setInviteError(json.error ?? "Failed to invite member");
        return;
      }

      setInviteMessage(json.message ?? `Invitation email sent to ${inviteEmail}!`);
      if (json.inviteUrl) {
        setInviteUrl(json.inviteUrl);
      }
      setInviteEmail("");
      fetchMembers();
    } catch (err: any) {
      setInviteError(err?.message || "An error occurred");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const copyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Team Members & Access Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {members.length} Active Member{members.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Invite team members via email and manage granular role-based privileges.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setInviteError("");
              setInviteMessage("");
              setInviteUrl("");
              setShowInviteModal(true);
            }}
            id="invite-member-btn"
            className="rounded-full px-6 py-2.5 text-xs font-bold shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Invite Member via Email
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-3">
          <Link
            href="/settings"
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-950 leading-none">
                My Profile
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1.5 truncate">
                Name, email, and password
              </p>
            </div>
          </Link>

          <Link
            href="/settings"
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-950 leading-none">
                Workspace Settings
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1.5 truncate">
                Organization & database telemetry
              </p>
            </div>
          </Link>

          <div className="w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 text-left border bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/40 shadow-lg ring-1 ring-white/10 scale-[1.01]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white leading-none">
                Team Members
              </p>
              <p className="text-xs font-medium text-indigo-200 mt-1.5 truncate">
                Manage invitations & access
              </p>
            </div>
          </div>

          {/* RBAC Info */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-2 mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Role Permissions Guide</span>
            </div>
            <div className="text-[11px] text-indigo-900/80 space-y-1 pt-1">
              <p>• <strong>ADMIN</strong>: Full control + team management</p>
              <p>• <strong>ANALYST</strong>: Ingest data + generate reports</p>
              <p>• <strong>VIEWER</strong>: Read-only analytics access</p>
            </div>
          </div>
        </div>

        {/* Main Members List (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">Active Team Roster</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Users with authorized access to this workspace.
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {members.map((member) => {
                  const isCurrentUser = member.id === session?.user?.id;
                  const initial = (member.name || member.email)[0].toUpperCase();

                  return (
                    <div key={member.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-600 to-sky-500 text-white font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{member.name || member.email.split("@")[0]}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isAdmin && !isCurrentUser ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            className="input-base text-xs py-1 px-3 h-8 font-semibold rounded-xl bg-slate-50 hover:bg-slate-100"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                            {member.role}
                          </span>
                        )}

                        {isAdmin && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Invite Team Member via Email</h3>
                  <p className="text-[11px] text-slate-500">Send an invitation email with a direct join link</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{inviteMessage}</span>
                </div>
                {inviteUrl && (
                  <div className="mt-1 p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-slate-600 truncate">{inviteUrl}</span>
                    <button
                      onClick={copyLink}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {inviteError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Colleague's Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-base text-xs h-11"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Assigned Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="input-base text-xs h-11 font-medium cursor-pointer"
                >
                  <option value="VIEWER">VIEWER — Read-only dashboard and reports</option>
                  <option value="ANALYST">ANALYST — Ingest feedback, manage themes, generate reports</option>
                  <option value="ADMIN">ADMIN — Full permissions + manage team members</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                  type="button"
                  size="sm"
                  className="rounded-full text-xs font-bold px-5"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  loading={inviteLoading}
                  id="send-invite-btn"
                  size="sm"
                  className="rounded-full text-xs font-bold px-6"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  Dispatch Invite Email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
