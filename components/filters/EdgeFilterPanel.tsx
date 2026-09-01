"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterPanel } from "./FilterPanel";

const PANEL_WIDTH = 280;
const CLOSE_DELAY_MS = 300;

type EdgeFilterPanelProps = {
  onCountrySelect?: (countryCode: string | null) => void;
  onGenreSelect?: (genreId: string | null) => void;
  onClearFilters?: () => void;
};

export function EdgeFilterPanel({
  onCountrySelect,
  onGenreSelect,
  onClearFilters,
}: EdgeFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, [cancelClose]);

  const handleOpen = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  return (
    <>
      {/* Desktop: left edge trigger */}
      <div
        className="absolute left-0 top-0 z-30 hidden h-full w-6 md:block"
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          onFocus={handleOpen}
          className="absolute left-0 top-1/2 h-24 w-2 -translate-y-1/2 rounded-r-full bg-[rgba(58,143,183,0.28)] opacity-35 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--ocean)]/50"
          aria-label="打开国家和类型筛选"
          aria-expanded={open}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -PANEL_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -PANEL_WIDTH }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-panel motion-reduce:transition-none absolute left-0 top-0 z-40 hidden h-full overflow-y-auto p-4 md:block"
            style={{ width: PANEL_WIDTH }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              筛选
            </h2>
            <FilterPanel
              onCountrySelect={onCountrySelect}
              onGenreSelect={onGenreSelect}
              onClearFilters={onClearFilters}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
