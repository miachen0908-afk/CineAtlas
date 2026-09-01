"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type DriftWallItem = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
};

type Props = {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  tilt?: number;
  turn?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: "up" | "down";
  variance?: number;
  parallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  overlayColor?: string;
  radius?: number;
  paused?: boolean;
  selectedId?: string | null;
  onSelect: (item: DriftWallItem, anchor: DOMRect) => void;
};

type WallStyle = CSSProperties & Record<`--${string}`, string | number>;

export function DriftWall({
  items,
  columns = 5,
  tileWidth = 184,
  tileHeight = 144,
  gap = 16,
  tilt = 1,
  turn = 1,
  perspective = 1200,
  depth = 150,
  speed = 32,
  direction = "down",
  variance = 0.4,
  parallax = 1.2,
  lift = 64,
  fade = 0.2,
  dim = 0.6,
  overlayColor = "#0f0f0f",
  radius = 16,
  paused = false,
  selectedId,
  onSelect,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [responsiveColumns, setResponsiveColumns] = useState(columns);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const width = root.clientWidth;
      setResponsiveColumns(width < 560 ? Math.min(3, columns) : width < 900 ? Math.min(4, columns) : columns);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [columns]);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const cycleLength = Math.max(items.length, 6);
  const animationDuration = Math.max(18, (cycleLength * (tileHeight + gap)) / Math.max(speed, 1));
  const stopped = paused || hovered || focusWithin || reducedMotion || !pageVisible;

  const columnsData = useMemo(() => Array.from({ length: responsiveColumns }, (_, columnIndex) => {
    const cycle = Array.from({ length: cycleLength }, (_, index) => items[(index + columnIndex) % items.length]);
    return [...cycle, ...cycle];
  }), [cycleLength, items, responsiveColumns]);

  if (!items.length) return null;

  const updateParallax = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * parallax;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * parallax;
    event.currentTarget.style.setProperty("--drift-x", `${x}deg`);
    event.currentTarget.style.setProperty("--drift-y", `${-y}deg`);
  };

  const resetParallax = (element: HTMLDivElement) => {
    element.style.setProperty("--drift-x", "0deg");
    element.style.setProperty("--drift-y", "0deg");
  };

  const rootStyle: WallStyle = {
    "--drift-columns": responsiveColumns,
    "--drift-tile-width": `${tileWidth}px`,
    "--drift-tile-height": `${tileHeight}px`,
    "--drift-gap": `${gap}px`,
    "--drift-perspective": `${perspective}px`,
    "--drift-tilt": `${tilt}deg`,
    "--drift-turn": `${turn}deg`,
    "--drift-lift": `${lift}px`,
    "--drift-radius": `${radius}px`,
    "--drift-overlay": overlayColor,
    "--drift-fade": fade,
    "--drift-dim": dim,
    "--drift-x": "0deg",
    "--drift-y": "0deg",
  };

  return <div
    ref={rootRef}
    className="drift-wall"
    style={rootStyle}
    onPointerMove={updateParallax}
    onPointerEnter={() => setHovered(true)}
    onPointerLeave={(event) => { setHovered(false); resetParallax(event.currentTarget); }}
    onFocusCapture={() => setFocusWithin(true)}
    onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
    }}
    aria-label="电影创作者滚动相册"
  >
    <div className="drift-wall-stage">
      {columnsData.map((columnItems, columnIndex) => {
        const columnDepth = responsiveColumns <= 1 ? 0 : ((columnIndex / (responsiveColumns - 1)) - 0.5) * depth;
        const delay = -(columnIndex / Math.max(responsiveColumns, 1)) * animationDuration * (1 + variance);
        const followsBaseDirection = columnIndex % 2 === 0;
        const movesDown = followsBaseDirection ? direction === "down" : direction !== "down";
        const columnStyle: WallStyle = {
          "--drift-duration": `${animationDuration}s`,
          "--drift-delay": `${delay}s`,
          "--drift-depth": `${columnDepth}px`,
          "--drift-column-turn": `${(columnIndex - (responsiveColumns - 1) / 2) * turn}deg`,
          animationDirection: movesDown ? "normal" : "reverse",
          animationPlayState: stopped ? "paused" : "running",
        };
        return <div className="drift-wall-column" key={columnIndex}>
          <div className="drift-wall-column-track" style={columnStyle}>
            {columnItems.map((item, itemIndex) => {
              const keyboardReachable = columnIndex === 0 && itemIndex < cycleLength && itemIndex < items.length;
              const selected = item.id === selectedId;
              return <button
                type="button"
                key={`${columnIndex}-${itemIndex}-${item.id}`}
                tabIndex={keyboardReachable ? 0 : -1}
                className={`drift-wall-tile ${selected ? "is-selected" : ""}`}
                style={{ backgroundImage: `url("${item.image}")` }}
                onClick={(event) => onSelect(item, event.currentTarget.getBoundingClientRect())}
                onPointerUp={(event) => {
                  if (event.pointerType === "mouse") onSelect(item, event.currentTarget.getBoundingClientRect());
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onSelect(item, event.currentTarget.getBoundingClientRect());
                }}
                aria-label={`${item.title}${item.subtitle ? `，${item.subtitle}` : ""}`}
                aria-pressed={selected}
                aria-hidden={!keyboardReachable}
              >
                <span className="drift-wall-tile-shade" aria-hidden />
                <span className="drift-wall-tile-copy">
                  <strong>{item.title}</strong>
                  {item.subtitle && <small>{item.subtitle}</small>}
                </span>
              </button>;
            })}
          </div>
        </div>;
      })}
    </div>
    <span className="drift-wall-fade drift-wall-fade-top" aria-hidden />
    <span className="drift-wall-fade drift-wall-fade-bottom" aria-hidden />
  </div>;
}
