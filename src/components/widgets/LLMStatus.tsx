"use client";
import { ReactNode } from "react";
import WidgetCard from "../WidgetCard";
import { useFetch } from "@/hooks/useFetch";
import styles from "./widgets.module.css";

interface StatusData {
  indicator: string;
  description: string;
  components: { name: string; status: string }[];
  error?: string;
}

interface LLMProvider {
  name: string;
  key: string;
  logo: ReactNode;
  url: string;
}

// --- SVG Logos ---
const OpenAILogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
);

const AnthropicLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.304 2H13.39l6.697 20h3.914L17.304 2zM6.697 2L0 22h3.914l1.332-4.064h6.813l.636 1.94L13.39 22h3.914L10.61 2H6.697zm-.676 12.768L8.39 7.848l2.37 6.92H6.021z" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MistralLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="1" y="3" width="4" height="4" fill="#F7D046"/>
    <rect x="19" y="3" width="4" height="4" fill="#F7D046"/>
    <rect x="1" y="7" width="4" height="4" fill="#F2A73B"/>
    <rect x="5" y="7" width="4" height="4" fill="#F2A73B"/>
    <rect x="15" y="7" width="4" height="4" fill="#F2A73B"/>
    <rect x="19" y="7" width="4" height="4" fill="#F2A73B"/>
    <rect x="1" y="11" width="4" height="4" fill="#EE792F"/>
    <rect x="9" y="11" width="6" height="4" fill="#EE792F"/>
    <rect x="19" y="11" width="4" height="4" fill="#EE792F"/>
    <rect x="1" y="15" width="4" height="4" fill="#EB5829"/>
    <rect x="5" y="15" width="4" height="4" fill="#EB5829"/>
    <rect x="15" y="15" width="4" height="4" fill="#EB5829"/>
    <rect x="19" y="15" width="4" height="4" fill="#EB5829"/>
    <rect x="1" y="19" width="4" height="2" fill="#1E1E1E"/>
    <rect x="19" y="19" width="4" height="2" fill="#1E1E1E"/>
  </svg>
);

const GroqLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#F55036" strokeWidth="2.5"/>
    <circle cx="12" cy="12" r="4" fill="#F55036"/>
  </svg>
);

const CohereLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 4C7.58 4 4 7 4 11c0 2.5 1.5 4.5 3.5 5.5L6 20l4-2.5c.6.1 1.3.2 2 .2 4.42 0 8-3 8-6.7S16.42 4 12 4z" fill="#39594D"/>
    <circle cx="9" cy="11" r="1.5" fill="#D18EE2"/>
    <circle cx="15" cy="11" r="1.5" fill="#D18EE2"/>
  </svg>
);

const MetaLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489a.707.707 0 0 0 .156-.553c-.15-.979-.2-2.299-.2-2.299s-1.6-.3-2.2-.3c-1.2 0-1.8.9-2.1 1.5-.3.7-.5 1.6-1.3 1.6H3c.4-1.2 1.1-2.3 2.2-3 .7-.5 1.6-.7 2.5-.7.4 0 .8 0 1.2.1.3-1.1.8-2.1 1.5-2.8-2.1-.5-4.4-1.6-4.4-5 0-1.1.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.8 1.1.8-.2 1.7-.35 2.5-.35s1.7.1 2.5.35c2-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.8 1.1 2.9 0 3.4-2.3 4.5-4.4 5 .5.6.9 1.5.9 2.9v4.3a.75.75 0 0 0 .2.55C19.1 20.2 22 16.4 22 12c0-5.523-4.477-10-10-10z" fill="#0084FF"/>
  </svg>
);

const PerplexityLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" stroke="#20B8CD" strokeWidth="1.5" fill="none"/>
    <path d="M12 2v20M4 7l8 5 8-5M4 17l8-5 8 5" stroke="#20B8CD" strokeWidth="1.5"/>
  </svg>
);

const DeepSeekLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#4D6BFE"/>
    <path d="M8 12.5c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5-1.5 3.5-4 3.5-4-1.5-4-3.5z" fill="white"/>
    <circle cx="10.5" cy="12" r="1" fill="#4D6BFE"/>
    <circle cx="13.5" cy="12" r="1" fill="#4D6BFE"/>
  </svg>
);

const QwenLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#6C3CFF"/>
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white" fontFamily="sans-serif">Q</text>
  </svg>
);

const ZhipuLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#1A73E8"/>
    <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BaichuanLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF6B35"/>
    <path d="M8 16V8l4 4 4-4v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MiniMaxLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#00C9A7"/>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">MM</text>
  </svg>
);

const LLM_PROVIDERS: LLMProvider[] = [
  { name: "OpenAI", key: "openai", logo: <OpenAILogo />, url: "https://status.openai.com" },
  { name: "Anthropic", key: "anthropic", logo: <AnthropicLogo />, url: "https://status.anthropic.com" },
  { name: "Google AI", key: "google", logo: <GoogleLogo />, url: "https://status.cloud.google.com" },
  { name: "Mistral", key: "mistral", logo: <MistralLogo />, url: "https://status.mistral.ai" },
  { name: "Groq", key: "groq", logo: <GroqLogo />, url: "https://status.groq.com" },
  { name: "Cohere", key: "cohere", logo: <CohereLogo />, url: "https://status.cohere.com" },
  { name: "Meta AI", key: "meta", logo: <MetaLogo />, url: "https://ai.meta.com" },
  { name: "Perplexity", key: "perplexity", logo: <PerplexityLogo />, url: "https://status.perplexity.ai" },
  { name: "DeepSeek", key: "deepseek", logo: <DeepSeekLogo />, url: "https://status.deepseek.com" },
  { name: "Qwen", key: "qwen", logo: <QwenLogo />, url: "https://qwen.ai" },
  { name: "Zhipu AI", key: "zhipu", logo: <ZhipuLogo />, url: "https://open.bigmodel.cn" },
  { name: "Baichuan", key: "baichuan", logo: <BaichuanLogo />, url: "https://www.baichuan-ai.com" },
  { name: "MiniMax", key: "minimax", logo: <MiniMaxLogo />, url: "https://www.minimaxi.com" },
];

function getStatusClass(status?: string): string {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s.includes("operational") || s.includes("none") || s.includes("resolved")) return "operational";
  if (s.includes("degraded") || s.includes("partial") || s.includes("minor")) return "degraded";
  if (s.includes("major") || s.includes("critical") || s.includes("outage")) return "down";
  return "operational";
}

function getStatusLabel(status?: string): string {
  if (!status) return "Unknown";
  const s = status.toLowerCase();
  if (s.includes("operational") || s.includes("none") || s.includes("resolved")) return "Operational";
  if (s.includes("degraded") || s.includes("partial") || s.includes("minor")) return "Degraded";
  if (s.includes("major") || s.includes("critical") || s.includes("outage")) return "Outage";
  return "Operational";
}

function getBadgeClass(statusClass: string): string {
  if (statusClass === "operational") return "badge badge-green";
  if (statusClass === "degraded") return "badge badge-amber";
  if (statusClass === "down") return "badge badge-red";
  return "badge badge-blue";
}

const StatusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export default function LLMStatus() {
  const { data, loading, error, lastUpdated, refresh } = useFetch<
    Record<string, StatusData>
  >("/api/llm-status", {
    refreshInterval: 2 * 60 * 1000,
  });

  return (
    <WidgetCard
      title="LLM Status"
      icon={<StatusIcon />}
      accentColor="green"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
    >
      {LLM_PROVIDERS.map((provider) => {
        const status = data?.[provider.key];
        const statusClass = getStatusClass(status?.indicator);
        const statusLabel = getStatusLabel(status?.indicator);
        const components = status?.components || [];

        return (
          <div key={provider.key} className={styles.statusRow}>
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              {provider.logo}
            </span>
            <a
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.statusName}
              style={{ color: "var(--text-primary)", textDecoration: "none" }}
            >
              {provider.name}
            </a>
            {components.length > 0 && (
              <span
                className={styles.statusValue}
                style={{ color: "var(--text-muted)", fontSize: "10px" }}
              >
                {components.filter((c) => c.status === "operational").length}/
                {components.length}
              </span>
            )}
            <span className={getBadgeClass(statusClass)}>{statusLabel}</span>
            <span className={`status-dot ${statusClass}`} />
          </div>
        );
      })}
    </WidgetCard>
  );
}
