"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type ShinyTitleImageProps = {
  src: string;
  width: number;
  height: number;
  displayHeight: string;
  disabled?: boolean;
  speed?: number;
  delay?: number;
  spread?: number;
  direction?: "left" | "right";
  className?: string;
};

export function ShinyTitleImage({
  src,
  width,
  height,
  displayHeight,
  disabled = false,
  speed = 2.2,
  delay = 1.4,
  spread = 110,
  direction = "left",
  className = "",
}: ShinyTitleImageProps) {
  const startPosition = direction === "left" ? "160% center" : "-60% center";
  const endPosition = direction === "left" ? "-60% center" : "160% center";

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{
        height: displayHeight,
        aspectRatio: `${width} / ${height}`,
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-contain opacity-80"
      />
      <motion.span
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${spread}deg, transparent 28%, rgba(188, 218, 255, 0.08) 40%, rgba(255, 255, 255, 0.98) 50%, rgba(201, 181, 255, 0.18) 60%, transparent 72%)`,
          backgroundPosition: startPosition,
          backgroundRepeat: "no-repeat",
          backgroundSize: "220% 100%",
          filter: "drop-shadow(0 0 8px rgba(210, 230, 255, 0.34))",
          maskImage: `url("${src}")`,
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskImage: `url("${src}")`,
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
        }}
        animate={{
          backgroundPosition: disabled ? startPosition : endPosition,
        }}
        transition={
          disabled
            ? { duration: 0 }
            : {
                duration: speed,
                delay,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: delay,
              }
        }
      />
    </span>
  );
}
