import {
  getAdzunaCodeFromCountryName,
  getAdzunaCountryByName,
} from "@/lib/jobs/adzuna-countries";
import {
  extractFilterOptionsFromJobs,
  getCitiesForState,
  getStatesForCountry,
} from "@/lib/jobs/extract-filter-options";
import {
  getAdzunaCountriesWithJobs,
  getAdzunaJobSamples,
} from "@/lib/jobs/providers/adzuna-provider";

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function mergeLocationOption(value: string, options: string[]) {
  if (!value || value === "any" || options.includes(value)) {
    return options;
  }

  return [value, ...options];
}

export async function getAdzunaLocationFilterOptions({
  country,
  state,
}: {
  country?: string | null;
  state?: string | null;
}) {
  const countriesWithJobs = await getAdzunaCountriesWithJobs();
  const countries = countriesWithJobs.map((entry) => entry.name);

  if (!country || country === "any") {
    return {
      countries,
      states: [],
      cities: [],
    };
  }

  const adzunaCountry = getAdzunaCountryByName(country);
  const adzunaCode =
    adzunaCountry?.code ?? getAdzunaCodeFromCountryName(country);
  const canonicalCountryName = adzunaCountry?.name ?? country;

  const nationwideJobs = await getAdzunaJobSamples(adzunaCode);
  const nationwideOptions = extractFilterOptionsFromJobs(
    nationwideJobs.map((job) => ({
      ...job,
      country: canonicalCountryName,
    }))
  );
  const states = getStatesForCountry(
    nationwideOptions.locations,
    canonicalCountryName
  );

  if (!state || state === "any") {
    return {
      countries,
      states: uniqueSorted(mergeLocationOption("", states)),
      cities: [],
    };
  }

  const stateJobs = await getAdzunaJobSamples(adzunaCode, { where: state });
  const stateOptions = extractFilterOptionsFromJobs(
    stateJobs.map((job) => ({
      ...job,
      country: canonicalCountryName,
    }))
  );
  const cities = getCitiesForState(
    stateOptions.locations,
    canonicalCountryName,
    state
  );

  return {
    countries,
    states: uniqueSorted(mergeLocationOption(state, states)),
    cities: uniqueSorted(mergeLocationOption("", cities)),
  };
}
