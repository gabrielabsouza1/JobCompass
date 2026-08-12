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
  getAdzunaJobCount,
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

async function filterLocationsWithJobs(
  adzunaCode: string,
  locations: string[]
) {
  const results = await Promise.all(
    locations.map(async (location) => {
      const count = await getAdzunaJobCount(adzunaCode, location);

      return count > 0 ? location : null;
    })
  );

  return results.filter((location): location is string => Boolean(location));
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
  const candidateStates = getStatesForCountry(
    nationwideOptions.locations,
    canonicalCountryName
  );
  const states = await filterLocationsWithJobs(adzunaCode, candidateStates);
  const candidateCities = getCitiesForState(
    nationwideOptions.locations,
    canonicalCountryName,
    "any"
  );

  if (!state || state === "any") {
    const cities = await filterLocationsWithJobs(adzunaCode, candidateCities);

    return {
      countries,
      states: uniqueSorted(mergeLocationOption("", states)),
      cities: uniqueSorted(mergeLocationOption("", cities)),
    };
  }

  const stateJobs = await getAdzunaJobSamples(adzunaCode, { where: state });
  const stateOptions = extractFilterOptionsFromJobs(
    stateJobs.map((job) => ({
      ...job,
      country: canonicalCountryName,
    }))
  );
  const candidateStateCities = getCitiesForState(
    stateOptions.locations,
    canonicalCountryName,
    state
  );
  const cities = await filterLocationsWithJobs(
    adzunaCode,
    candidateStateCities
  );

  return {
    countries,
    states: uniqueSorted(mergeLocationOption(state, states)),
    cities: uniqueSorted(mergeLocationOption("", cities)),
  };
}
