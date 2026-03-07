"use client";
import { useState } from "react";
import WidgetCard from "../WidgetCard";
import { useFetch } from "@/hooks/useFetch";
import styles from "./widgets.module.css";

interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  summary?: string;
  published: string;
  category: string;
  link: string;
}

const CATEGORIES = [
  { key: "cs.AI", label: "AI" },
  { key: "cs.LG", label: "ML" },
  { key: "cs.CL", label: "NLP" },
  { key: "cs.SE", label: "SWE" },
  { key: "cs.DC", label: "Systems" },
];

export default function ArxivPapers() {
  const [category, setCategory] = useState("cs.AI");

  const { data, loading, error, lastUpdated, refresh } = useFetch<ArxivPaper[]>(
    `/api/arxiv?category=${category}`,
    {
      cacheKey: `arxiv-${category}`,
      refreshInterval: 15 * 60 * 1000,
    }
  );

  return (
    <WidgetCard
      title="arXiv Papers"
      icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
      accentColor="purple"
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={refresh}
      tabs={CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
      activeTab={category}
      onTabChange={setCategory}
    >
      {data && data.length > 0 ? (
        data.map((paper, i) => (
          <div key={paper.id || i} className={styles.paperEntry}>
            <div className={styles.paperTitle}>
              <a href={paper.link} target="_blank" rel="noopener noreferrer">
                {paper.title}
              </a>
            </div>
            <div className={styles.paperAuthors}>{paper.authors}</div>
            <div className={styles.feedMeta}>
              <span className="badge badge-purple">{paper.category}</span>
              <span className={styles.metaDot} />
              <span>{paper.published}</span>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>No papers found</div>
      )}
    </WidgetCard>
  );
}
