import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agncy | In-House Personal Content Studio",
  description: "Local-first, AI-assisted content agency workspace for Elton.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-slate-50 min-h-screen antialiased selection:bg-brand-amber/30 selection:text-brand-amber">
        {children}
      </body>
    </html>
  );
}
