import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-canvas text-slate-100 min-h-screen font-sans antialiased selection:bg-brand-amber/30 selection:text-brand-amber">
        {children}
      </body>
    </html>
  );
}
