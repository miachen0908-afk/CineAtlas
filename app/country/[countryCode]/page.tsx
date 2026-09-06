import { Suspense } from "react";
import { CountryPageClient } from "@/components/country/CountryPageClient";
import { CountryArchiveBackground } from "@/components/country/CountryArchiveBackground";
import { MapQuerySync } from "@/components/map/MapQuerySync";
import {
  getSiteCountryHistoryPageData,
  getSiteFilms,
  getStaticCountryParams,
} from "@/lib/siteData";

type Props = {
  params: Promise<{ countryCode: string }>;
};

export function generateStaticParams() {
  return getStaticCountryParams();
}

export const dynamicParams = false;

export default async function CountryPage({ params }: Props) {
  const { countryCode } = await params;
  const [allFilms, historyData] = await Promise.all([
    getSiteFilms(),
    getSiteCountryHistoryPageData(countryCode),
  ]);

  return (
    <CountryArchiveBackground showAurora={false}>
      <Suspense fallback={null}>
        <MapQuerySync />
      </Suspense>
      <CountryPageClient
        countryCode={countryCode}
        allFilms={allFilms}
        history={historyData.history}
        editorState={historyData.editorState}
      />
    </CountryArchiveBackground>
  );
}
