/** Map internal country codes to Natural Earth / world-atlas numeric IDs (string, as in TopoJSON). */
export const COUNTRY_ISO_NUMERIC: Record<string, string> = {
  cn: "156",
  jp: "392",
  kr: "410",
  ir: "364",
  in: "356",
  th: "764",
  vn: "704",
  sg: "702",
  tw: "158",
  hk: "344",
  au: "036",
  nz: "554",
  fr: "250",
  gb: "826",
  it: "380",
  se: "752",
  de: "276",
  ru: "643",
  dk: "208",
  za: "710",
  ng: "566",
  us: "840",
  ca: "124",
  mx: "484",
  ar: "032",
  br: "076",
};

/** Regions without usable polygons in the 110m layout data — use center hotspots for posters. */
export const COUNTRY_HOTSPOT_CODES = ["sg", "hk"] as const;

export type CountryHotspotCode = (typeof COUNTRY_HOTSPOT_CODES)[number];

export function getIsoNumericId(countryCode: string): string | undefined {
  return COUNTRY_ISO_NUMERIC[countryCode];
}

const ISO_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_ISO_NUMERIC).map(([code, iso]) => [iso, code])
);

/** Reverse map: Natural Earth id → project country code. */
export function getCountryCodeFromIso(isoId: string): string | undefined {
  return ISO_TO_CODE[isoId];
}

export function isCountryHotspot(code: string): code is CountryHotspotCode {
  return (COUNTRY_HOTSPOT_CODES as readonly string[]).includes(code);
}
