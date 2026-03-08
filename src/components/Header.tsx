"use client";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import WidgetPicker from "./WidgetPicker";

export default function Header() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timezone = Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone.split("/")
    .pop()
    ?.replace("_", " ");

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
              <polyline points="7 8 10 11 7 14" />
              <line x1="13" y1="13" x2="17" y2="13" />
            </svg>
          </div>
          <span className={styles.logoText}>DevMonitor</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statusPills}>
          <div className={styles.statusPill}>
            <span className="status-dot operational" />
            <span>GitHub</span>
          </div>
          <div className={styles.statusPill}>
            <span className="status-dot operational" />
            <span>NPM</span>
          </div>
          <div className={styles.statusPill}>
            <span className="status-dot operational" />
            <span>Vercel</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.quickLinks}>
          <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
            ChatGPT
          </a>
          <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
            Gemini
          </a>
          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
            Claude
          </a>
          <a href="https://perplexity.ai" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
            Perplexity
          </a>
        </div>
      </div>
      <div className={styles.right}>
        <WidgetPicker />
        <div className={styles.divider} />
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          LIVE
        </div>
        <div className={styles.divider} />
        <div className={styles.clock} suppressHydrationWarning>
          <span className={styles.time} suppressHydrationWarning>
            {formattedTime}
          </span>
          <span className={styles.dateZone} suppressHydrationWarning>
            {formattedDate} · {timezone}
          </span>
        </div>
      </div>
    </header>
  );
}
