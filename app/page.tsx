import { Suspense } from "react";
import { MapHomeQueryClient } from "@/components/map/MapHomeQueryClient";
import { getSiteFilms } from "@/lib/siteData";

export default async function HomePage() {
  const films = await getSiteFilms();

  return (
    <div className="glass-home relative isolate flex flex-1 flex-col overflow-hidden">
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={null}>
          <MapHomeQueryClient films={films} />
        </Suspense>
      </div>
    </div>
  );
}
