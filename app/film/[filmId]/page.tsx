import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FilmDetail } from "@/components/film/FilmDetail";
import { FilmQuerySync } from "@/components/film/FilmQuerySync";
import { getFilmWithRelations } from "@/lib/repositories/films";

type Props = {
  params: Promise<{ filmId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FilmPage({ params, searchParams }: Props) {
  const { filmId } = await params;
  const query = await searchParams;
  const film = await getFilmWithRelations(filmId);

  if (!film) notFound();

  const backParams = new URLSearchParams();
  if (query.yearStart) backParams.set("yearStart", String(query.yearStart));
  if (query.yearEnd) backParams.set("yearEnd", String(query.yearEnd));
  if (query.year && !query.yearStart) {
    backParams.set("yearStart", String(query.year));
    backParams.set("yearEnd", String(query.year));
  }
  if (query.country) backParams.set("country", String(query.country));
  if (query.genre) backParams.set("genre", String(query.genre));
  const backHref = backParams.toString() ? `/?${backParams}` : "/";

  return (
    <div className="starfield-bg flex-1">
      <Suspense fallback={null}>
        <FilmQuerySync />
      </Suspense>
      <FilmDetail film={film} backHref={backHref} />
    </div>
  );
}
