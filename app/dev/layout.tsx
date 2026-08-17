// app/dev/layout.tsx
// Developer Panel — Standalone Light Theme layout

export const metadata = {
  title: "Developer Panel | Project LOOP",
  description: "Internal developer tools for Project LOOP",
  robots: "noindex, nofollow",
};

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F8FAFC", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#0F172A", WebkitFontSmoothing: "antialiased" }}>
        {children}
      </body>
    </html>
  );
}
