const JOOBLE_DOMAIN_BY_COUNTRY: Record<string, string> = {
  AU: "au.jooble.org",
  US: "jooble.org",
  GB: "uk.jooble.org",
  UK: "uk.jooble.org",
  DE: "de.jooble.org",
  FR: "fr.jooble.org",
  CA: "ca.jooble.org",
  NZ: "nz.jooble.org",
};

const DEFAULT_JOOBLE_DOMAIN = "au.jooble.org";

export function getJoobleApiHost(countryCode?: string) {
  const normalized = countryCode?.trim().toUpperCase();

  if (!normalized) {
    return DEFAULT_JOOBLE_DOMAIN;
  }

  return JOOBLE_DOMAIN_BY_COUNTRY[normalized] ?? DEFAULT_JOOBLE_DOMAIN;
}
