"use client";

import { motion } from "framer-motion";
import type { HomeExperiencePhase } from "./HomeExperienceContext";
import { ShinyTitleImage } from "./ShinyTitleImage";

const TITLE_HEIGHT =
  "min(clamp(38px, 7.2vw, 104px), calc((100vw - 32px) / 9.4854))";
const CHINESE_TITLE_SCALE = 0.96;
const ENGLISH_TITLE_SCALE = 0.48;

type IntroBrandTitleProps = {
  phase: HomeExperiencePhase;
  reducedMotion: boolean;
};

export function IntroBrandTitle({
  phase,
  reducedMotion,
}: IntroBrandTitleProps) {
  return (
    <motion.div
      key="cineatlas-intro-title"
      initial={
        reducedMotion
          ? false
          : { y: "32vh", opacity: 0.02, filter: "blur(18px)" }
      }
      animate={
        phase === "intro"
          ? { y: 0, opacity: 1, filter: "blur(0px)" }
          : {
              y: 0,
              opacity: 0,
              filter: "blur(10px)",
            }
      }
      exit={{ opacity: 0 }}
      transition={{
        duration:
          phase === "intro"
            ? reducedMotion
              ? 0.01
              : 2.3
            : reducedMotion
              ? 0.15
              : 0.9,
        delay: phase === "intro" && !reducedMotion ? 0.1 : 0,
        ease: phase === "intro" ? [0.16, 1, 0.3, 1] : [0.4, 0, 0.2, 1],
      }}
      className="pointer-events-none absolute inset-0 z-0 text-center text-[#eef5ff]"
      aria-hidden={phase === "exiting"}
    >
      <div className="absolute inset-x-0 top-[38%] flex -translate-y-1/2 flex-col items-center px-4">
        <h1 className="sr-only">影迹 CineAtlas</h1>
        <div
          className="flex flex-col items-center gap-[clamp(11.5px,1.61vw,25.3px)] drop-shadow-[0_0_22px_rgba(170,207,255,0.2)]"
          style={{ "--intro-title-height": TITLE_HEIGHT } as React.CSSProperties}
          aria-hidden
        >
          <ShinyTitleImage
            src="/branding/cineatlas-title-zh.png"
            width={1373}
            height={508}
            displayHeight={`calc(var(--intro-title-height) * ${CHINESE_TITLE_SCALE})`}
            disabled={reducedMotion}
          />
          <ShinyTitleImage
            src="/branding/cineatlas-title-en.png"
            width={1954}
            height={206}
            displayHeight={`calc(var(--intro-title-height) * ${ENGLISH_TITLE_SCALE})`}
            disabled={reducedMotion}
          />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: phase === "intro" ? 0.58 : 0,
            y: 0,
          }}
          transition={{
            duration: reducedMotion ? 0.01 : 0.35,
            delay: phase === "intro" && !reducedMotion ? 2.35 : 0,
          }}
          className="mt-8 text-[10px] tracking-[0.42em] text-[#dbe8f8] md:text-xs"
        >
          点击进入 · ENTER
        </motion.p>
      </div>
    </motion.div>
  );
}
