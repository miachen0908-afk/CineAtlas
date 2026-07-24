import { MapHomeClient } from "@/components/map/MapHomeClient";
import { getAllFilms } from "@/lib/repositories/films";

export default async function HomePage() {
  const films = await getAllFilms();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MapHomeClient films={films} />
    </div>
  );
}
