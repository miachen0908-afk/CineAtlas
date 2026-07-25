"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterPanel } from "./FilterPanel";

const PANEL_WIDTH = 280;
const CLOSE_DELAY_MS = 300;

export function EdgeFilterPanel() {
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
      {/* Desktop: right edge trigger */}
      <div
        className="absolute right-0 top-0 z-30 hidden h-full w-6 md:block"
        onMouseEnter={handleOpen}
        onMouseLeave={scheduleClose}
        aria-hidden
      />

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: PANEL_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: PANEL_WIDTH }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="motion-reduce:transition-none absolute right-0 top-0 z-40 hidden h-full overflow-y-auto border-l border-[var(--border-soft)] bg-[var(--paper-translucent)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-md md:block"
            style={{ width: PANEL_WIDTH }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              筛选
            </h2>
            <FilterPanel />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
