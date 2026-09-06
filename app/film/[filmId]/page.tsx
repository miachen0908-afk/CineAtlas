import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilmDetail } from "@/components/film/FilmDetail";
import { MapQuerySync } from "@/components/map/MapQuerySync";
import {
  getSiteFilmWithRelations,
  getStaticFilmParams,
} from "@/lib/siteData";

type Props = {
  params: Promise<{ filmId: string }>;
};

export function generateStaticParams() {
  return getStaticFilmParams();
}

export const dynamicParams = false;

export default async function FilmPage({ params }: Props) {
  const { filmId } = await params;
  const film = await getSiteFilmWithRelations(filmId);

  if (!film) notFound();

  return (
    <div className="starfield-bg flex-1">
      <Suspense fallback={null}>
        <MapQuerySync />
      </Suspense>
      <Suspense fallback={null}>
        <FilmDetail film={film} />
      </Suspense>
    </div>
  );
}
