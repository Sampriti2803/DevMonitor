"use client";
import Header from "@/components/Header";
import GithubTrending from "@/components/widgets/GithubTrending";
import LLMStatus from "@/components/widgets/LLMStatus";
import HackerNews from "@/components/widgets/HackerNews";
import ArxivPapers from "@/components/widgets/ArxivPapers";
import ClaudeReleases from "@/components/widgets/ClaudeReleases";
import ChatGPTReleases from "@/components/widgets/ChatGPTReleases";
import GeminiReleases from "@/components/widgets/GeminiReleases";
import DevToolsReleases from "@/components/widgets/DevToolsReleases";

export default function Home() {
  return (
    <div className="dashboard-layout">
      <Header />
      <main className="widget-grid">
        <GithubTrending />
        <LLMStatus />
        <HackerNews />
        <ArxivPapers />
        <ClaudeReleases />
        <ChatGPTReleases />
        <GeminiReleases />
        <DevToolsReleases />
      </main>
    </div>
  );
}
