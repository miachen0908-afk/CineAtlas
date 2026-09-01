"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useHomeExperience } from "@/components/home/HomeExperienceContext";
import { ShinyTitleImage } from "@/components/home/ShinyTitleImage";
import {
  isMapDetailPath,
  markMapReturnPending,
} from "@/components/home/mapReturnNavigation";
import { buildMapQueryParams, useMapStore } from "@/store/useMapStore";

export function Header() {
  const pathname = usePathname();
  const isGlobeHome = pathname === "/";
  const { phase } = useHomeExperience();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const introActive = isGlobeHome && phase !== "ready";
  const yearStart = useMapStore((state) => state.yearStart);
  const yearEnd = useMapStore((state) => state.yearEnd);
  const selectedCountryCode = useMapStore(
    (state) => state.selectedCountryCode
  );
  const selectedGenreId = useMapStore((state) => state.selectedGenreId);
  const isMapDetailPage = isMapDetailPath(pathname);
  const routeCountryCode = pathname.startsWith("/country/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "") || null
    : null;
  const mapQuery = buildMapQueryParams({
    yearStart,
    yearEnd,
    selectedCountryCode: routeCountryCode ?? selectedCountryCode,
    selectedGenreId,
  });
  const brandHref = isMapDetailPage ? `/?${mapQuery}` : "/";

  return (
    <motion.header
      initial={isGlobeHome ? { opacity: 0, y: -12 } : false}
      animate={{
        opacity: introActive ? 0 : 1,
        y: introActive ? -12 : 0,
      }}
      transition={{ duration: introActive ? 0.16 : 0.42, ease: "easeOut" }}
      aria-hidden={introActive}
      className={`site-header relative z-50 flex shrink-0 items-center px-4 pb-3 pt-8 md:px-6 ${
        introActive
          ? "pointer-events-none bg-transparent"
          : "brand-header glass-bar"
      }`}
    >
      <Link
        href={brandHref}
        onClick={isMapDetailPage ? markMapReturnPending : undefined}
        className="group flex min-w-0 items-center gap-2 md:gap-3"
        aria-label="影迹 CineAtlas 首页"
      >
        <ShinyTitleImage
          src="/branding/cineatlas-title-zh.png"
          width={1373}
          height={508}
          displayHeight="clamp(20px, 1.7vw, 24px)"
          disabled={prefersReducedMotion}
          delay={1.8}
        />
        <ShinyTitleImage
          src="/branding/cineatlas-title-en.png"
          width={1954}
          height={206}
          displayHeight="clamp(16px, 1.36vw, 19.2px)"
          disabled={prefersReducedMotion}
          delay={1.8}
        />
      </Link>
    </motion.header>
  );
}
