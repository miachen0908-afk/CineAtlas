import Link from "next/link";

export function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[var(--border-soft)] bg-[var(--paper-translucent)] px-4 py-3 backdrop-blur-md md:px-6">
      <Link
        href="/"
        className="group flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
      >
        <span className="text-lg font-medium tracking-widest text-[var(--ink)] md:text-xl">
          影迹
        </span>
        <span className="hidden text-[10px] tracking-wide text-[var(--ink-muted)] sm:inline md:text-xs">
          CineAtlas · Explore Cinema Across Time and Place
        </span>
      </Link>
      <button
        type="button"
        className="hidden rounded-full border border-[var(--border-soft)] bg-white/70 px-4 py-1.5 text-sm text-[var(--ink-muted)] md:block"
        aria-label="搜索（占位）"
        disabled
      >
        搜索影片…
      </button>
    </header>
  );
}
