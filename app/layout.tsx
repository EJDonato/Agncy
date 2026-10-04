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
  icons: {
    icon: "/assets/agncy-logo.png",
    shortcut: "/assets/agncy-logo.png",
    apple: "/assets/agncy-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-canvas text-slate-900 min-h-screen font-sans antialiased selection:bg-[#1f54fc]/15 selection:text-[#1f54fc]">
        {children}
      </body>
    </html>
  );
}
