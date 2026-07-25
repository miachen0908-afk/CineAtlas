"use client";

import dynamic from "next/dynamic";

const CesiumPrototypeClient = dynamic(
  () =>
    import("@/components/cesium/CesiumPrototypeClient").then(
      (m) => m.CesiumPrototypeClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-black text-sm text-white/60">
        载入 Cesium 原型…
      </div>
    ),
  }
);

export default function CesiumPrototypePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CesiumPrototypeClient />
    </div>
  );
}
