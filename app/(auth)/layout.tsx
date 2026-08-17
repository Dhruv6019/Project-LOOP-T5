// app/(auth)/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LoopLogo from "@/components/ui/LoopLogo";

export const metadata: Metadata = {
  title: "Sign In | LOOP",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Full-Width Ambient Glows */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-amber-200/60 via-orange-100/40 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-sky-200/70 via-cyan-100/40 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1 group">
            <LoopLogo size={36} className="text-slate-950 group-hover:text-indigo-600 transition-colors" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Customer Feedback Intelligence
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
