import { CountryPageClient } from "@/components/country/CountryPageClient";
import { getAllFilms } from "@/lib/repositories/films";

type Props = {
  params: Promise<{ countryCode: string }>;
};

export default async function CountryPage({ params }: Props) {
  const { countryCode } = await params;
  const allFilms = await getAllFilms();

  return (
    <div className="starfield-bg flex-1">
      <CountryPageClient countryCode={countryCode} allFilms={allFilms} />
    </div>
  );
}
