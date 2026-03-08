"use client";
import { useState, useRef, useEffect } from "react";
import registry from "./widgetRegistry";
import { useDashboard } from "./DashboardGrid";
import styles from "./WidgetPicker.module.css";

export default function WidgetPicker() {
    const { activeIds, toggleWidget, resetLayout } = useDashboard();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    /* close on outside click */
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                btnRef.current &&
                !btnRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className={styles.wrapper}>
            <button
                ref={btnRef}
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
                title="Choose widgets"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Widgets</span>
            </button>

            {open && (
                <div ref={panelRef} className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>Widgets</span>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <button
                                className={styles.resetBtn}
                                onClick={resetLayout}
                                title="Reset to defaults"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                Reset
                            </button>
                            <span className={styles.panelCount}>
                                {activeIds.length}/{registry.length}
                            </span>
                        </div>
                    </div>
                    <div className={styles.panelBody}>
                        {registry.map((w) => {
                            const isActive = activeIds.includes(w.id);
                            return (
                                <button
                                    key={w.id}
                                    className={`${styles.item} ${isActive ? styles.itemActive : ""
                                        }`}
                                    onClick={() => toggleWidget(w.id)}
                                >
                                    <span
                                        className={styles.dot}
                                        style={{ background: isActive ? w.accentColor : "var(--text-muted)" }}
                                    />
                                    <span className={styles.itemLabel}>{w.label}</span>
                                    <span className={styles.toggle}>
                                        <span
                                            className={`${styles.toggleTrack} ${isActive ? styles.toggleOn : ""
                                                }`}
                                        >
                                            <span className={styles.toggleThumb} />
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
