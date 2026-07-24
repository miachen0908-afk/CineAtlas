import Link from "next/link";

export function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a12]/80 px-4 py-3 backdrop-blur-md md:px-6">
      <Link href="/" className="group flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-lg font-light tracking-widest text-[#e8d5a3] md:text-xl">
          影迹
        </span>
        <span className="hidden text-[10px] tracking-wide text-white/35 sm:inline md:text-xs">
          CineAtlas · Explore Cinema Across Time and Place
        </span>
      </Link>
      <div className="flex items-center gap-3 md:gap-6">
        <button
          type="button"
          className="hidden rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/50 md:block"
          aria-label="搜索（占位）"
          disabled
        >
          搜索影片…
        </button>
        <Link
          href="/people"
          className="rounded-full border border-[#c9a962]/40 px-3 py-1.5 text-sm text-[#e8d5a3] transition-colors hover:border-[#c9a962]/70 hover:bg-[#c9a962]/10 md:px-4"
        >
          影人长廊
        </Link>
      </div>
    </header>
  );
}
