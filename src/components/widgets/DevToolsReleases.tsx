"use client";
import { ReactNode } from "react";
import WidgetCard from "../WidgetCard";
import { useFetch } from "@/hooks/useFetch";
import { timeAgo } from "@/utils/api";
import styles from "./widgets.module.css";

interface DevRelease {
  repo: string;
  name: string;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  prerelease?: boolean;
}

interface DevTool {
  repo: string;
  name: string;
  icon: ReactNode;
}

const DEV_TOOLS: DevTool[] = [
  { repo: "microsoft/vscode", name: "VS Code", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17 2l5 4.5v11L17 22l-6.5-5L4 22l-3-2.5V4.5L4 2l6.5 5L17 2z" fill="#0078D4"/><path d="M17 2v20l5-4.5v-11L17 2z" fill="#0098FF" opacity=".7"/></svg> },
  { repo: "nodejs/node", name: "Node.js", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#539E43"><path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22h-.93c-.12 0-.22.1-.22.22v8.47c0 .66-.68 1.31-1.77.76L4.43 16.5a.26.26 0 0 1-.13-.22V7.7c0-.09.05-.17.13-.22l7.44-4.3c.08-.04.18-.04.26 0l7.44 4.3c.08.05.13.13.13.22v8.58c0 .09-.05.17-.13.22l-7.44 4.3c-.08.04-.17.04-.26 0l-1.88-1.12c-.07-.04-.16-.05-.23-.02-.65.37-.77.41-1.38.63-.15.05-.38.15.09.42l2.45 1.45c.23.14.5.2.78.2s.55-.07.78-.2l7.44-4.3c.48-.28.78-.8.78-1.36V7.7c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.78-.2z"/></svg> },
  { repo: "denoland/deno", name: "Deno", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="#12124B"/><path d="M14.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" fill="white"/><path d="M12 13c-3 0-5 2-5 4h10c0-2-2-4-5-4z" fill="white"/></svg> },
  { repo: "rust-lang/rust", name: "Rust", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6v12M6 12h12M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1" opacity=".5"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg> },
  { repo: "golang/go", name: "Go", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9-4-9-9z" fill="#00ADD8"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">Go</text></svg> },
  { repo: "vercel/next.js", name: "Next.js", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.84 14.595l-6.736-9.49v7.163H9.23V7.572h.978l6.35 8.88V8.21h.875v8.385z"/></svg> },
  { repo: "docker/compose", name: "Docker", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 4h3v3h-3V4zm-4 0h3v3H9V4zm-4 0h3v3H5V4zm4 4h3v3H9V8zm-4 0h3v3H5V8zm-4 4h3v3H1v-3zm4 0h3v3H5v-3zm4 0h3v3H9v-3zm4 0h3v3h-3v-3z" fill="#2496ED"/><path d="M23 11.5c-.6-.4-2-.5-3-.2-.2-1.2-.9-2.3-1.8-3l-.4-.3-.3.4c-.4.6-.6 1.3-.6 2 0 .7.2 1.3.5 1.9-.7.4-2 .5-2.4.5H.5c-.3 1 .1 2.4.5 3.4.4.8 1.1 1.5 1.9 2 1 .5 2.4.8 4 .8 3.7 0 6.5-1.7 8-5 .8 0 2.5 0 3.4-1.7l.2-.4-.5-.3z" fill="#2496ED"/></svg> },
  { repo: "python/cpython", name: "Python", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2c-1.67 0-3 .5-3.94 1.21C7 4 7 5.5 7 6.5V9h5v1H6c-1.5 0-3 1-3 3.5S4 18 6 18h2v-2.5c0-1.5 1-3 3-3h4c1.5 0 2.5-1 2.5-2.5V6.5C17.5 4 15 2 12 2zm-2 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#3572A5"/><path d="M12 22c1.67 0 3-.5 3.94-1.21C17 20 17 18.5 17 17.5V15h-5v-1h6c1.5 0 3-1 3-3.5S20 6 18 6h-2v2.5c0 1.5-1 3-3 3h-4c-1.5 0-2.5 1-2.5 2.5v3.5C6.5 20 9 22 12 22zm2-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#FFD43B"/></svg> },
  { repo: "oven-sh/bun", name: "Bun", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="9" fill="#FBF0DF"/><circle cx="12" cy="13" r="9" stroke="#F9A825" strokeWidth="1"/><circle cx="9" cy="12" r="1.2" fill="#2D2D2D"/><circle cx="15" cy="12" r="1.2" fill="#2D2D2D"/><path d="M10 15c.5.7 1.2 1 2 1s1.5-.3 2-1" stroke="#2D2D2D" strokeWidth="1" fill="none" strokeLinecap="round"/></svg> },
  { repo: "sveltejs/svelte", name: "Svelte", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20.4 4.5c-2-3-6-4.2-9-2.5L5.8 5.5C3.7 6.7 2.4 9 2.5 11.3c0 1.4.5 2.7 1.4 3.8-.3 1-.3 2-.1 3 .5 2.3 2 4.2 4.2 5.1l5.6 3.5c3 1.7 7 .5 9-2.5.9-1.3 1.2-2.9 1-4.4.9-1 1.4-2.4 1.4-3.8 0-2.3-1.3-4.5-3.4-5.8L20.4 4.5z" fill="#FF3E00"/><path d="M10.2 19.7c-1.6.4-3.4-.2-4.3-1.6-.5-.8-.7-1.7-.5-2.6l.1-.4.1-.3.3.2c.7.5 1.5.9 2.3 1.1l.2.1v.2c0 .4.2.8.5 1 .3.2.7.3 1.1.2l.2-.1 5.6-3.4c.3-.2.5-.5.6-.9 0-.4-.1-.8-.4-1l-5.6-3.4c-.2-.1-.4-.2-.5-.2 0 0-.1 0-.1.1-.3.2-.6.3-1 .2-.4-.1-.7-.3-.9-.6-.5-.8-.2-1.8.5-2.3l5.6-3.5c.5-.3 1.1-.4 1.7-.3 1.6.4 2.8 1.7 3 3.3v.4l-.1.3-.3-.2c-.7-.5-1.5-.9-2.3-1.1l-.2-.1v-.2c0-.4-.2-.8-.5-1-.3-.2-.7-.3-1.1-.2l-.2.1-5.6 3.4c-.3.2-.5.5-.6.9 0 .4.1.8.4 1l5.6 3.4.4.2h.1c.3-.2.6-.2.9-.1s.6.3.8.6c.5.8.2 1.8-.5 2.3l-5.5 3.6-.5.2z" fill="#fff"/></svg> },
];

const PackageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/>
    <polyline points="2.32 6.16 12 11 21.68 6.16"/>
    <line x1="12" y1="22.76" x2="12" y2="11"/>
  </svg>
);

export default function DevToolsReleases() {
  const { data, loading, error, lastUpdated, refresh } = useFetch<DevRelease[]>(
    "/api/dev-releases",
    { refreshInterval: 15 * 60 * 1000 }
  );

  return (
    <WidgetCard
      title="Dev Releases"
      icon={<PackageIcon />}
      accentColor="cyan"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
    >
      {data && data.length > 0 ? (
        data.map((release, i) => {
          const tool = DEV_TOOLS.find((t) =>
            release.repo?.includes(t.repo.split("/")[1])
          );
          const isNew =
            release.published_at &&
            Date.now() - new Date(release.published_at).getTime() <
              24 * 60 * 60 * 1000;

          return (
            <div key={i} className={styles.statusRow}>
              <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                {tool?.icon || <PackageIcon />}
              </span>
              <a
                href={release.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.statusName}
                style={{ color: "var(--text-primary)", textDecoration: "none" }}
              >
                {release.name || tool?.name || release.repo}
              </a>
              <span
                className={styles.statusValue}
                style={{ color: "var(--accent-cyan)" }}
              >
                {release.tag_name}
              </span>
              {isNew && <span className="badge badge-green">NEW</span>}
              <span
                className={styles.statusValue}
                style={{ color: "var(--text-muted)" }}
              >
                {release.published_at ? timeAgo(release.published_at) : ""}
              </span>
            </div>
          );
        })
      ) : (
        <div className={styles.emptyState}>No release data available</div>
      )}
    </WidgetCard>
  );
}
