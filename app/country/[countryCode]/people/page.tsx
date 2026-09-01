import { Suspense } from "react";
import { MapQuerySync } from "@/components/map/MapQuerySync";
import { CountryPeoplePageClient } from "@/components/country/CountryPeoplePageClient";
import { CountryArchiveBackground } from "@/components/country/CountryArchiveBackground";

type Props = {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function CountryPeoplePage({ params, searchParams }: Props) {
  const [{ countryCode }, query] = await Promise.all([params, searchParams]);
  return (
    <CountryArchiveBackground showAurora={false}>
      <Suspense fallback={null}><MapQuerySync /></Suspense>
      <CountryPeoplePageClient
        countryCode={countryCode}
        selectedPersonId={firstValue(query.person)}
      />
    </CountryArchiveBackground>
  );
}
