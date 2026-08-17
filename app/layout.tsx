// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | LOOP",
    default: "LOOP — AI Customer Feedback Intelligence",
  },
  description:
    "LOOP turns scattered customer feedback into ranked, evidence-backed decisions. AI-powered theme clustering, sentiment analysis, and grounded Q&A.",
  keywords: ["customer feedback", "AI", "product analytics", "sentiment analysis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background antialiased">{children}</body>
    </html>
  );
}
