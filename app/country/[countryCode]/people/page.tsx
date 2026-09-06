import { Suspense } from "react";
import { MapQuerySync } from "@/components/map/MapQuerySync";
import { CountryPeoplePageClient } from "@/components/country/CountryPeoplePageClient";
import { CountryArchiveBackground } from "@/components/country/CountryArchiveBackground";
import { getStaticCountryParams } from "@/lib/siteData";

type Props = {
  params: Promise<{ countryCode: string }>;
};

export function generateStaticParams() {
  return getStaticCountryParams();
}

export const dynamicParams = false;

export default async function CountryPeoplePage({ params }: Props) {
  const { countryCode } = await params;
  return (
    <CountryArchiveBackground showAurora={false}>
      <Suspense fallback={null}><MapQuerySync /></Suspense>
      <Suspense fallback={null}>
        <CountryPeoplePageClient countryCode={countryCode} />
      </Suspense>
    </CountryArchiveBackground>
  );
}
