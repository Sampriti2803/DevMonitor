"use client";
import { ReactNode } from "react";
import styles from "./WidgetCard.module.css";

interface Tab {
  key: string;
  label: string;
}

interface WidgetCardProps {
  title: string;
  icon: ReactNode;
  accentColor?: "green" | "red" | "amber" | "blue" | "purple" | "cyan" | "orange";
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  tabs?: Tab[] | null;
  activeTab?: string | null;
  onTabChange?: (key: string) => void;
  headerRight?: ReactNode;
  className?: string;
}

const colorMap: Record<string, string> = {
  green: "var(--accent-green)",
  red: "var(--accent-red)",
  amber: "var(--accent-amber)",
  blue: "var(--accent-blue)",
  purple: "var(--accent-purple)",
  cyan: "var(--accent-cyan)",
  orange: "var(--accent-orange)",
};

export default function WidgetCard({
  title,
  icon,
  accentColor = "blue",
  children,
  loading = false,
  error = null,
  lastUpdated = null,
  onRefresh,
  tabs = null,
  activeTab = null,
  onTabChange,
  headerRight,
  className = "",
}: WidgetCardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.icon} style={{ color: colorMap[accentColor] }}>
            {icon}
          </span>
          <h3 className={styles.title}>{title}</h3>
          {lastUpdated && (
            <button
              className={styles.refreshBtn}
              onClick={onRefresh}
              title="Refresh"
            >
              ↻
            </button>
          )}
        </div>
        <div className={styles.headerRight}>
          {headerRight}
          {tabs && (
            <div className={styles.tabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${
                    activeTab === tab.key ? styles.tabActive : ""
                  }`}
                  onClick={() => onTabChange?.(tab.key)}
                  style={
                    activeTab === tab.key
                      ? { color: colorMap[accentColor] }
                      : undefined
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        {loading ? (
          <div className={styles.skeletonContainer}>
            {[75, 88, 65, 82, 70, 78].map((w, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div
                  className="skeleton-line"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠</span>
            <span className={styles.errorText}>{error}</span>
            {onRefresh && (
              <button className={styles.retryBtn} onClick={onRefresh}>
                Retry
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
