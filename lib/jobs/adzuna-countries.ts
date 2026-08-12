export type AdzunaCountry = {
  code: string;
  name: string;
  aliases: string[];
};

export const ADZUNA_COUNTRIES: AdzunaCountry[] = [
  {
    code: "au",
    name: "Australia",
    aliases: ["au", "australia"],
  },
  {
    code: "gb",
    name: "United Kingdom",
    aliases: ["gb", "uk", "united kingdom", "great britain"],
  },
  {
    code: "us",
    name: "United States",
    aliases: ["us", "usa", "united states", "united states of america"],
  },
  {
    code: "ca",
    name: "Canada",
    aliases: ["ca", "canada"],
  },
  {
    code: "nz",
    name: "New Zealand",
    aliases: ["nz", "new zealand"],
  },
  {
    code: "de",
    name: "Germany",
    aliases: ["de", "germany", "deutschland"],
  },
  {
    code: "fr",
    name: "France",
    aliases: ["fr", "france"],
  },
  {
    code: "in",
    name: "India",
    aliases: ["in", "india"],
  },
  {
    code: "pl",
    name: "Poland",
    aliases: ["pl", "poland"],
  },
  {
    code: "br",
    name: "Brazil",
    aliases: ["br", "brazil", "brasil"],
  },
  {
    code: "at",
    name: "Austria",
    aliases: ["at", "austria"],
  },
  {
    code: "za",
    name: "South Africa",
    aliases: ["za", "south africa"],
  },
];

function normalizeCountryToken(value: string) {
  return value.toLowerCase().trim();
}

export function getAdzunaCountryByCode(code: string) {
  const normalized = normalizeCountryToken(code);

  return ADZUNA_COUNTRIES.find(
    (country) => country.code === normalized
  );
}

export function getAdzunaCountryByName(name: string) {
  const normalized = normalizeCountryToken(name);

  return ADZUNA_COUNTRIES.find(
    (country) =>
      normalizeCountryToken(country.name) === normalized ||
      country.aliases.includes(normalized)
  );
}

export function getAdzunaCodeFromCountryName(name: string) {
  return getAdzunaCountryByName(name)?.code ?? name.toLowerCase().slice(0, 2);
}

export function getAdzunaCountryNameFromCode(code: string) {
  return getAdzunaCountryByCode(code)?.name ?? code.toUpperCase();
}
