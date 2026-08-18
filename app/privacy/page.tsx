// app/privacy/page.tsx
// Public Privacy Policy Page — Accessible without login

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Project LOOP",
  description: "Privacy Policy and data governance standards for Project LOOP.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-200">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-slate-900">Project LOOP</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Privacy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Last Updated: January 1, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            At Project LOOP, we are dedicated to protecting your privacy and ensuring transparency regarding how customer feedback and workspace telemetry are processed.
          </p>
        </div>

        <section className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Information We Collect</h2>
            <p>
              We collect information necessary to provide Voice of Customer intelligence, including account credentials (name, email), workspace configurations, and customer feedback ingested via CSV or live integrations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. How We Use Feedback Data</h2>
            <p>
              Your data is processed strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Performing NLP sentiment classification and score attribution.</li>
              <li>Generating semantic vector embeddings for grounded AI Copilot querying.</li>
              <li>Compiling statistical volume charts, theme distributions, and executive summaries.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Data Security & Multi-Tenancy</h2>
            <p>
              All customer data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Workspace data is strictly isolated with tenant-scoped query filters.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. Third-Party Model Processing</h2>
            <p>
              When AI analysis is performed, text chunks are sent securely over encrypted endpoints to enterprise API tiers with zero-retention guarantees. We do not sell or monetize your data.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. Contact Our Privacy Team</h2>
            <p>
              For any privacy inquiries or data deletion requests, please contact our Data Governance team at{" "}
              <a href="mailto:privacy@projectloop.ai" className="font-semibold text-indigo-600 underline">
                privacy@projectloop.ai
              </a>.
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 Project LOOP Intelligence Inc. All rights reserved.</p>
          <Link href="/terms" className="font-medium text-indigo-600 hover:underline">
            View Terms & Conditions →
          </Link>
        </div>
      </main>
    </div>
  );
}
