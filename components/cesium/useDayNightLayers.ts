"use client";

import { useEffect, useRef } from "react";
import type { Viewer, ImageryLayer } from "cesium";
import type { CesiumDayNightMode } from "@/types/cesium-prototype";

const DAY_URL = "/textures/cesium/earth-day.png";
const NIGHT_URL = "/textures/cesium/earth-night.png";
const DAY_FALLBACK = "/textures/cesium/earth-day-fallback.png";
const NIGHT_FALLBACK = "/textures/cesium/earth-night-fallback.png";

const TRANSITION_MS = 1000;

type DayNightLayers = {
  day: ImageryLayer;
  night: ImageryLayer;
};

async function createLayer(
  Cesium: typeof import("cesium"),
  viewer: Viewer,
  url: string,
  fallbackUrl: string,
  alpha: number
): Promise<ImageryLayer> {
  const rectangle = Cesium.Rectangle.fromDegrees(-180, -90, 180, 90);
  try {
    const provider = await Cesium.SingleTileImageryProvider.fromUrl(url, {
      rectangle,
    });
    const layer = viewer.imageryLayers.addImageryProvider(provider);
    layer.alpha = alpha;
    return layer;
  } catch {
    const provider = await Cesium.SingleTileImageryProvider.fromUrl(
      fallbackUrl,
      {
        rectangle,
      }
    );
    const layer = viewer.imageryLayers.addImageryProvider(provider);
    layer.alpha = alpha;
    return layer;
  }
}

export async function setupDayNightLayers(
  Cesium: typeof import("cesium"),
  viewer: Viewer,
  initialMode: CesiumDayNightMode
): Promise<DayNightLayers> {
  viewer.imageryLayers.removeAll();
  const day = await createLayer(
    Cesium,
    viewer,
    DAY_URL,
    DAY_FALLBACK,
    initialMode === "day" ? 1 : 0
  );
  const night = await createLayer(
    Cesium,
    viewer,
    NIGHT_URL,
    NIGHT_FALLBACK,
    initialMode === "night" ? 1 : 0
  );
  return { day, night };
}

export function useDayNightTransition(
  layersRef: React.RefObject<DayNightLayers | null>,
  mode: CesiumDayNightMode
) {
  const animRef = useRef<number | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    const layers = layersRef.current;
    if (!layers) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targetDay = mode === "day" ? 1 : 0;
    const targetNight = mode === "night" ? 1 : 0;

    if (prefersReduced) {
      layers.day.alpha = targetDay;
      layers.night.alpha = targetNight;
      modeRef.current = mode;
      return;
    }

    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
    }

    const startDay = layers.day.alpha;
    const startNight = layers.night.alpha;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TRANSITION_MS);
      const eased = t * t * (3 - 2 * t);
      layers.day.alpha = startDay + (targetDay - startDay) * eased;
      layers.night.alpha = startNight + (targetNight - startNight) * eased;
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
        modeRef.current = mode;
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [mode, layersRef]);
}
