"use client";
import WidgetCard from "../WidgetCard";
import { useFetch } from "@/hooks/useFetch";
import styles from "./widgets.module.css";

interface FeedItem {
  title: string;
  description: string;
  link: string;
  category: string;
  pubDate: string;
}

function getCategoryBadgeClass(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("product") || c.includes("model")) return "badge badge-amber";
  if (c.includes("announcement")) return "badge badge-blue";
  if (c.includes("research") || c.includes("safety")) return "badge badge-purple";
  if (c.includes("tool") || c.includes("code")) return "badge badge-cyan";
  return "badge badge-amber";
}

export default function ClaudeReleases() {
  const { data, loading, error, lastUpdated, refresh } = useFetch<FeedItem[]>(
    "/api/anthropic-feed",
    { refreshInterval: 15 * 60 * 1000 }
  );

  return (
    <WidgetCard
      title="Anthropic Updates"
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.304 2H13.39l6.697 20h3.914L17.304 2zM6.697 2L0 22h3.914l1.332-4.064h6.813l.636 1.94L13.39 22h3.914L10.61 2H6.697zm-.676 12.768L8.39 7.848l2.37 6.92H6.021z" />
        </svg>
      }
      accentColor="amber"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
    >
      {data && data.length > 0 ? (
        data.map((item, i) => (
          <div key={i} className={styles.releaseEntry}>
            <div className={styles.releaseHeader}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.releaseTitle}
              >
                {item.title}
              </a>
              <span className={styles.releaseDate}>{item.pubDate}</span>
            </div>
            {item.description && (
              <div className={styles.releaseBody}>{item.description}</div>
            )}
            <div className={styles.releaseTags}>
              <span className={getCategoryBadgeClass(item.category)}>
                {item.category}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No updates available</div>
      )}
    </WidgetCard>
  );
}
