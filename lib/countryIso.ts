/** Map internal country codes to Natural Earth / world-atlas numeric IDs */
export const COUNTRY_ISO_NUMERIC: Record<string, string> = {
  cn: "156",
  jp: "392",
  fr: "250",
  it: "380",
  us: "840",
  in: "356",
};

export function getIsoNumericId(countryCode: string): string | undefined {
  return COUNTRY_ISO_NUMERIC[countryCode];
}
