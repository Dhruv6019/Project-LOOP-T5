"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SentimentBadge, ChannelBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/types";
import { Mail, CheckCircle2, AlertCircle, Send, X, Copy, Check, FileText, Share2, Printer } from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editActions, setEditActions] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);

  // Delete State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/reports/${params.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setReport(json.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleShare = () => {
    const url = `${window.location.origin}/reports/${params.id}?share=true`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const content = report.contentJson;

    const md = `# ${report.title}
*Evaluation Period: ${content.periodLabel}*
*Generated on ${new Date(report.createdAt).toLocaleDateString()} for Executive Leadership*

## Executive Summary
${content.executiveSummary}

## Top Feedback Themes
${content.topThemes?.map((t) => `- **${t.name}**: ${t.count} items (${t.delta >= 0 ? `+${t.delta}%` : `${t.delta}%`})`).join("\n") || "None"}

## Sentiment Breakdown
- Positive: ${content.sentimentAnalysis?.positive ?? 0}
- Neutral: ${content.sentimentAnalysis?.neutral ?? 0}
- Negative: ${content.sentimentAnalysis?.negative ?? 0}

## Recommended Product Actions
${content.recommendedActions?.map((a, i) => `${i + 1}. ${a}`).join("\n") || "None"}
`;

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setEmailError("");
    setEmailSuccess("");
    setEmailLoading(true);

    const recipients = emailInput
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    try {
      const res = await fetch(`/api/reports/${params.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          customNote: customNote.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setEmailError(json.error || "Failed to send report email");
        return;
      }

      setEmailSuccess(json.message || "Report emailed successfully!");
      setEmailInput("");
      setCustomNote("");
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess("");
      }, 2500);
    } catch (err: any) {
      setEmailError(err?.message || "An unexpected error occurred");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePrint = () => { window.print(); };

  const openEditModal = () => {
    if (!report) return;
    const content = report.contentJson;
    setEditTitle(report.title);
    setEditSummary(content.executiveSummary ?? "");
    setEditActions((content.recommendedActions ?? []).join("\n"));
    setEditError("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!report) return;
    setEditLoading(true); setEditError("");
    try {
      const actions = editActions.split("\n").map((a) => a.trim()).filter(Boolean);
      const res = await fetch(`/api/reports/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          manualEdits: { executiveSummary: editSummary, recommendedActions: actions },
        }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.error || "Failed to save."); return; }
      setReport(json.data); setShowEditModal(false);
    } finally { setEditLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!report) return;
    setRegenLoading(true); setEditError("");
    try {
      const res = await fetch(`/api/reports/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.error || "Regeneration failed."); return; }
      setReport(json.data); setShowEditModal(false);
    } finally { setRegenLoading(false); }
  };

  const handleDelete = async () => {
    if (!report) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/reports/${params.id}`, { method: "DELETE" });
      if (res.ok) router.push("/reports");
    } finally { setDeleteLoading(false); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-6">
        <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Report Not Found</h2>
        <Button onClick={() => router.push("/reports")}>Back to Reports</Button>
      </div>
    );
  }

  const content = report.contentJson;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16 print:p-0 print:max-w-none">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-slate-200/80 pb-4">
        <button
          onClick={() => router.push("/reports")}
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold cursor-pointer transition-colors"
        >
          ← Back to All Reports
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Report */}
          <button
            onClick={openEditModal}
            id="edit-report-btn"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Delete Report */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            id="delete-report-btn"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Email Report Button */}
          <button
            onClick={() => setShowEmailModal(true)}
            id="email-report-btn"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span>Send to Email</span>
          </button>

          <Button variant="secondary" size="sm" onClick={handleCopyMarkdown} id="copy-md-btn">
            {copiedMarkdown ? "✓ Markdown Copied!" : "📋 Copy Markdown"}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleShare} id="share-report-btn">
            {copiedLink ? "✓ Link Copied!" : "Share Link"}
          </Button>

          <Button variant="primary" size="sm" onClick={handlePrint} id="print-report-btn">
            Export / Print PDF
          </Button>
        </div>
      </div>

      {/* Report Document Box */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] space-y-8 print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-violet-50 text-violet-700 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-violet-100">
              Voice of Customer Report
            </span>
            <span className="text-xs text-slate-400 font-semibold">{content.periodLabel}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{report.title}</h1>
          <p className="text-xs text-slate-400 font-medium">
            Generated on {formatDate(report.createdAt)} • Prepared for Leadership
          </p>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600" /> Executive Summary
          </h2>
          <div className="p-5 bg-violet-50/50 border border-violet-100 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {content.executiveSummary}
          </div>
        </div>

        {/* Top Themes & Sentiment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Themes */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Feedback Themes</h3>
            <div className="space-y-2">
              {content.topThemes?.map((theme, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <span className="font-bold text-slate-800">{theme.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-medium">{theme.count} items</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      theme.delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {theme.delta >= 0 ? `+${theme.delta}%` : `${theme.delta}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sentiment Distribution</h3>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-emerald-700 font-bold">Positive Satisfaction</span>
                <span className="font-bold text-slate-800">{content.sentimentAnalysis?.positive ?? 0} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-bold">Neutral / Inquiries</span>
                <span className="font-bold text-slate-800">{content.sentimentAnalysis?.neutral ?? 0} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-rose-600 font-bold">Negative Friction</span>
                <span className="font-bold text-slate-800">{content.sentimentAnalysis?.negative ?? 0} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notable Verbatim Quotes */}
        {content.notableQuotes && content.notableQuotes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notable Customer Voice</h2>
            <div className="space-y-3">
              {content.notableQuotes.map((quote, i) => (
                <div key={i} className="p-4 bg-slate-50 border-l-4 border-violet-600 rounded-r-2xl space-y-2">
                  <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">&ldquo;{quote.content}&rdquo;</p>
                  <div className="flex items-center gap-2 pt-1">
                    <ChannelBadge channel={quote.channel} />
                    <SentimentBadge sentiment={quote.sentiment} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action Items */}
        {content.recommendedActions && content.recommendedActions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Product Decisions</h2>
            <div className="space-y-2">
              {content.recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 font-medium">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Report Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Email Executive Report</h3>
                  <p className="text-[11px] text-slate-500">Send an interactive VoC report directly to executive stakeholders</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emailSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            {emailError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Recipient Email(s)
                </label>
                <input
                  type="text"
                  required
                  placeholder="ceo@company.com, cpo@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="input-base text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate multiple emails with commas or spaces.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Custom Executive Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Please review our Q3 customer sentiment analysis and product decision recommendations before our executive sync."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="input-base text-xs resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">What will be delivered:</p>
                <p>• Branded HTML executive summary with sentiment breakdown</p>
                <p>• Ranked thematic clusters and recommended actions</p>
                <p>• One-click deep link to full interactive report</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowEmailModal(false)}
                  type="button"
                  size="sm"
                  className="rounded-full text-xs font-bold px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={emailLoading}
                  id="submit-email-report-btn"
                  size="sm"
                  className="rounded-full text-xs font-bold px-6"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  Send Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== EDIT REPORT MODAL ===== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl space-y-5 shadow-2xl border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">Edit VoC Report</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Manually edit content or regenerate with fresh AI analysis from the database.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">{editError}</div>
            )}

            {/* AI Regenerate Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-violet-800">✨ AI Regenerate from Database</p>
                <p className="text-[11px] text-violet-600 mt-0.5">Claude will re-read your real database feedback for this period and rewrite the entire report.</p>
              </div>
              <Button
                onClick={handleRegenerate}
                loading={regenLoading}
                id="regen-report-btn"
                size="sm"
                className="shrink-0"
              >
                {regenLoading ? "AI Regenerating…" : "Regenerate with AI"}
              </Button>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">— Or Edit Manually —</p>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Report Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input-base text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Executive Summary</label>
                <textarea
                  rows={5}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="input-base text-xs resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Recommended Actions</label>
                <p className="text-[11px] text-slate-400 mb-1.5">One action per line.</p>
                <textarea
                  rows={5}
                  value={editActions}
                  onChange={(e) => setEditActions(e.target.value)}
                  className="input-base text-xs resize-none font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} size="sm">Cancel</Button>
                <Button onClick={handleSaveEdit} loading={editLoading} id="save-edit-btn" size="sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto">
              <X className="w-6 h-6 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Report?</h3>
              <p className="text-xs text-slate-500">This will permanently delete <strong>{report?.title}</strong>. This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Cancel</Button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
