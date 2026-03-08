"use client";
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    createContext,
    useContext,
    type DragEvent,
    type ReactNode,
} from "react";
import registry, {
    DEFAULT_LAYOUT,
    DEFAULT_ACTIVE,
    getWidgetById,
} from "./widgetRegistry";
import styles from "./DashboardGrid.module.css";

const LS_LAYOUT = "devmonitor-layout";
const LS_ACTIVE = "devmonitor-active-widgets";

function loadJSON<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

/* ---- Context so WidgetPicker can toggle widgets ---- */
interface DashboardCtx {
    activeIds: string[];
    toggleWidget: (id: string) => void;
    resetLayout: () => void;
}

export const DashboardContext = createContext<DashboardCtx>({
    activeIds: DEFAULT_ACTIVE,
    toggleWidget: () => { },
    resetLayout: () => { },
});

export function useDashboard() {
    return useContext(DashboardContext);
}

/* ---- Main component ---- */
interface Props {
    children?: ReactNode; // e.g. <Header /> placed above the grid
}

export default function DashboardGrid({ children }: Props) {
    /* ---- state ---- */
    const [layout, setLayout] = useState<string[]>(() =>
        loadJSON(LS_LAYOUT, DEFAULT_LAYOUT)
    );
    const [activeIds, setActiveIds] = useState<string[]>(() =>
        loadJSON(LS_ACTIVE, DEFAULT_ACTIVE)
    );

    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const dragNodeRef = useRef<HTMLDivElement | null>(null);

    /* ---- merge new registry widgets into saved state ---- */
    useEffect(() => {
        const allIds = registry.map((w) => w.id);
        const newIds = allIds.filter((id) => !layout.includes(id));
        if (newIds.length > 0) {
            setLayout((prev) => [...prev, ...newIds]);
            // Auto-enable new widgets that are defaultEnabled
            const newActive = newIds.filter(
                (id) => registry.find((w) => w.id === id)?.defaultEnabled
            );
            if (newActive.length > 0) {
                setActiveIds((prev) => [...prev, ...newActive]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---- persist ---- */
    useEffect(() => {
        localStorage.setItem(LS_LAYOUT, JSON.stringify(layout));
    }, [layout]);

    useEffect(() => {
        localStorage.setItem(LS_ACTIVE, JSON.stringify(activeIds));
    }, [activeIds]);

    /* ---- visible widgets in layout order ---- */
    const visible = layout.filter((id) => activeIds.includes(id));

    /* ---- public API for WidgetPicker ---- */
    const toggleWidget = useCallback((id: string) => {
        setActiveIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        // Make sure the widget exists in layout
        setLayout((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const resetLayout = useCallback(() => {
        setLayout(DEFAULT_LAYOUT);
        setActiveIds(DEFAULT_ACTIVE);
        localStorage.removeItem(LS_LAYOUT);
        localStorage.removeItem(LS_ACTIVE);
    }, []);

    /* ---- drag handlers ---- */
    const handleDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
        setDragIdx(idx);
        dragNodeRef.current = e.currentTarget as HTMLDivElement;
        e.dataTransfer.effectAllowed = "move";
        requestAnimationFrame(() => {
            if (dragNodeRef.current) {
                dragNodeRef.current.classList.add(styles.dragging);
            }
        });
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragIdx === null || dragIdx === idx) return;
        setOverIdx(idx);
    };

    const handleDragLeave = () => {
        setOverIdx(null);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, dropIdx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === dropIdx) {
            cleanup();
            return;
        }

        const next = [...visible];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(dropIdx, 0, moved);

        // Rebuild full layout: visible in new order + any hidden items at the end
        const hiddenOrder = layout.filter((id) => !activeIds.includes(id));
        setLayout([...next, ...hiddenOrder]);

        cleanup();
    };

    const handleDragEnd = () => {
        cleanup();
    };

    const cleanup = () => {
        if (dragNodeRef.current) {
            dragNodeRef.current.classList.remove(styles.dragging);
        }
        setDragIdx(null);
        setOverIdx(null);
        dragNodeRef.current = null;
    };

    /* ---- render ---- */
    return (
        <DashboardContext.Provider value={{ activeIds, toggleWidget, resetLayout }}>
            {/* Header or other controls rendered above the grid */}
            {children}

            <main className={`widget-grid ${styles.grid}`}>
                {visible.map((id, idx) => {
                    const def = getWidgetById(id);
                    if (!def) return null;
                    const Widget = def.component;

                    const isOver = overIdx === idx && dragIdx !== idx;

                    return (
                        <div
                            key={id}
                            className={`${styles.cell} ${isOver ? styles.dropTarget : ""}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className={styles.dragHandle} title="Drag to reorder">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <circle cx="8" cy="4" r="2" />
                                    <circle cx="16" cy="4" r="2" />
                                    <circle cx="8" cy="12" r="2" />
                                    <circle cx="16" cy="12" r="2" />
                                    <circle cx="8" cy="20" r="2" />
                                    <circle cx="16" cy="20" r="2" />
                                </svg>
                            </div>
                            <Widget />
                        </div>
                    );
                })}

                {visible.length === 0 && (
                    <div className={styles.emptyDashboard}>
                        <span>No widgets active</span>
                        <span className={styles.emptyHint}>
                            Click <strong>Widgets</strong> in the header to add some
                        </span>
                    </div>
                )}
            </main>
        </DashboardContext.Provider>
    );
}
