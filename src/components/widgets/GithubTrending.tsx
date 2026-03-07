"use client";
import { useState } from "react";
import WidgetCard from "../WidgetCard";
import { useFetch } from "@/hooks/useFetch";
import { ENDPOINTS, LANG_COLORS, formatNumber, timeAgo } from "@/utils/api";
import styles from "./widgets.module.css";

interface GithubRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
}

export default function GithubTrending() {
  const [tab, setTab] = useState<"today" | "week">("today");

  const url =
    tab === "today"
      ? ENDPOINTS.GITHUB_TRENDING_TODAY()
      : ENDPOINTS.GITHUB_TRENDING_WEEK();

  const { data, loading, error, lastUpdated, refresh } = useFetch<GithubRepo[]>(
    url,
    {
      cacheKey: `github-trending-${tab}`,
      transform: (raw) => {
        const r = raw as { items?: GithubRepo[] };
        return r.items?.slice(0, 15) || [];
      },
      refreshInterval: 10 * 60 * 1000,
    }
  );

  return (
    <WidgetCard
      title="GitHub Trending"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>}
      accentColor="amber"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
      tabs={[
        { key: "today", label: "Today" },
        { key: "week", label: "Week" },
      ]}
      activeTab={tab}
      onTabChange={(key) => setTab(key as "today" | "week")}
    >
      {data && data.length > 0 ? (
        data.map((repo, i) => (
          <div key={repo.id} className={styles.feedItem}>
            <span className={styles.feedRank}>{i + 1}</span>
            <div className={styles.feedContent}>
              <div className={styles.feedTitle}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repo.full_name}
                </a>
              </div>
              {repo.description && (
                <div
                  className={styles.paperAbstract}
                  style={{ marginTop: "2px" }}
                >
                  {repo.description}
                </div>
              )}
              <div className={styles.feedMeta}>
                {repo.language && (
                  <span>
                    <span
                      className={styles.langDot}
                      style={{
                        background: LANG_COLORS[repo.language] || "#666",
                        width: 7,
                        height: 7,
                      }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className={styles.metaDot} />
                <span>★ {formatNumber(repo.stargazers_count)}</span>
                <span className={styles.metaDot} />
                <span>⑂ {formatNumber(repo.forks_count)}</span>
                <span className={styles.metaDot} />
                <span>{timeAgo(repo.created_at)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No trending repos found</div>
      )}
    </WidgetCard>
  );
}
