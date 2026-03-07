"use client";
import { useState, useEffect, useCallback } from "react";
import WidgetCard from "../WidgetCard";
import styles from "./widgets.module.css";

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  time: number;
  by: string;
}

type HNTab = "top" | "new" | "best";

const HN_ENDPOINTS: Record<HNTab, string> = {
  top: "https://hacker-news.firebaseio.com/v0/topstories.json",
  new: "https://hacker-news.firebaseio.com/v0/newstories.json",
  best: "https://hacker-news.firebaseio.com/v0/beststories.json",
};

export default function HackerNews() {
  const [tab, setTab] = useState<HNTab>("top");
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStories = useCallback(async (type: HNTab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(HN_ENDPOINTS[type]);
      const ids: number[] = await res.json();
      const top20 = ids.slice(0, 20);

      const items = await Promise.all(
        top20.map(async (id) => {
          const r = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          return r.json() as Promise<HNStory>;
        })
      );

      setStories(items.filter(Boolean));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories(tab);
    const interval = setInterval(() => fetchStories(tab), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tab, fetchStories]);

  const hnTimeAgo = (ts: number): string => {
    const seconds = Math.floor(Date.now() / 1000 - ts);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getDomain = (url?: string): string => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  };

  return (
    <WidgetCard
      title="Hacker News"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#FF6600"/><path d="M7 6l5 8.5L17 6h-2.4l-2.6 4.5L9.4 6H7zm5 10v4h0v-4z" fill="white"/></svg>}
      accentColor="orange"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={() => fetchStories(tab)}
      tabs={[
        { key: "top", label: "Top" },
        { key: "new", label: "New" },
        { key: "best", label: "Best" },
      ]}
      activeTab={tab}
      onTabChange={(key) => setTab(key as HNTab)}
    >
      {stories.length > 0 ? (
        stories.map((story, i) => (
          <div key={story.id} className={styles.feedItem}>
            <span className={styles.feedRank}>{i + 1}</span>
            <div className={styles.feedContent}>
              <div className={styles.feedTitle}>
                <a
                  href={
                    story.url ||
                    `https://news.ycombinator.com/item?id=${story.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {story.title}
                </a>
              </div>
              <div className={styles.feedMeta}>
                <span>▲ {story.score}</span>
                <span className={styles.metaDot} />
                <span>💬 {story.descendants || 0}</span>
                {story.url && (
                  <>
                    <span className={styles.metaDot} />
                    <span style={{ color: "var(--text-muted)" }}>
                      {getDomain(story.url)}
                    </span>
                  </>
                )}
                <span className={styles.metaDot} />
                <span>{hnTimeAgo(story.time)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No stories loaded</div>
      )}
    </WidgetCard>
  );
}
