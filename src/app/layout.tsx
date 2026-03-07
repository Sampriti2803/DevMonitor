import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevMonitor — Developer Intelligence Dashboard",
  description:
    "Real-time developer intelligence dashboard with GitHub trending, LLM status, tech news, arXiv papers, and dev tool releases.",
  keywords:
    "developer dashboard, GitHub trending, LLM status, Hacker News, arXiv papers, dev tools, tech news, real-time monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
