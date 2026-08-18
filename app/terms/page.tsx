// app/terms/page.tsx
// Public Terms and Conditions Page — Accessible without login

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Project LOOP",
  description: "Terms and conditions of use for Project LOOP Voice of Customer platform.",
};

export default function TermsPage() {
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
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">Terms</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-20 space-y-12">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Effective Date: January 1, 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Terms of Service & Usage
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to Project LOOP. By accessing or using our platform, APIs, and AI-powered customer feedback intelligence services, you agree to be bound by these terms.
          </p>
        </div>

        <section className="space-y-8 text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">1. Description of Service</h2>
            <p>
              Project LOOP provides multi-tenant Voice of Customer (VoC) analytics, automated sentiment classification, natural language querying, thematic clustering, and executive reporting.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">2. Data Ownership & Tenant Isolation</h2>
            <p>
              You retain all rights, title, and interest in and to all customer feedback data, CSV uploads, and inquiries you submit to the Service. Project LOOP enforces strict row-level security and tenant isolation across all database operations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">3. Artificial Intelligence & Vector Processing</h2>
            <p>
              Feedback processed through our NLP classifiers and vector search engines is strictly used to deliver insights to your workspace. Your customer data is never used to train third-party foundation models.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">4. User Accounts & Responsibilities</h2>
            <p>
              You are responsible for maintaining the security of your authentication credentials and for all activities that occur under your account. You agree not to upload malicious payloads or violate applicable privacy laws.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">5. Contact Information</h2>
            <p>
              If you have any questions regarding these terms, please contact us at{" "}
              <a href="mailto:support@projectloop.ai" className="font-semibold text-indigo-600 underline">
                support@projectloop.ai
              </a>.
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 Project LOOP Intelligence Inc. All rights reserved.</p>
          <Link href="/privacy" className="font-medium text-indigo-600 hover:underline">
            View Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
