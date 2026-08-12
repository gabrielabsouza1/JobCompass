import type { Job } from "@/types";

import {
  employmentTypeOptions,
  workModeOptions,
} from "@/data/profile-options";

export type JobsLocationOption = {
  country: string;
  state: string;
  city: string;
};

export type JobsFilterOptions = {
  countries: string[];
  states: string[];
  cities: string[];
  locations: JobsLocationOption[];
  workModes: string[];
  employmentTypes: string[];
  workRightsRisks: string[];
  sources: string[];
};

export type JobsFilterDefaults = {
  country: string;
  state: string;
  city: string;
  workMode: string;
  employmentType: string;
  workRights: string;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function jobEmploymentTypeToFilterValue(employmentType: string) {
  const normalized = employmentType.toLowerCase().trim();

  if (normalized.includes("full")) return "full_time";
  if (normalized.includes("part")) return "part_time";
  if (normalized.includes("casual")) return "casual";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("intern")) return "internship";

  if (normalized === "not listed" || normalized === "not_listed") {
    return "not_listed";
  }

  return normalized.replace(/-/g, "_").replace(/\s+/g, "_");
}

export function extractFilterOptionsFromJobs(jobs: Job[]): JobsFilterOptions {
  const countries = new Set<string>();
  const states = new Set<string>();
  const cities = new Set<string>();
  const locations: JobsLocationOption[] = [];
  const workModes = new Set<string>();
  const employmentTypes = new Set<string>();
  const workRightsRisks = new Set<string>();
  const sources = new Set<string>();

  for (const job of jobs) {
    const country = job.country.trim();
    const state = job.state.trim();
    const city = job.city.trim();

    if (country) {
      countries.add(country);
    }

    if (state) {
      states.add(state);
    }

    if (city) {
      cities.add(city);
    }

    if (country || state || city) {
      locations.push({ country, state, city });
    }

    if (job.workMode) {
      workModes.add(job.workMode);
    }

    employmentTypes.add(jobEmploymentTypeToFilterValue(job.employmentType));

    if (job.workRightsRisk) {
      workRightsRisks.add(job.workRightsRisk);
    }

    if (job.source) {
      sources.add(job.source);
    }
  }

  return {
    countries: uniqueSorted([...countries]),
    states: uniqueSorted([...states]),
    cities: uniqueSorted([...cities]),
    locations,
    workModes: uniqueSorted([...workModes]),
    employmentTypes: uniqueSorted([...employmentTypes]),
    workRightsRisks: uniqueSorted([...workRightsRisks]),
    sources: uniqueSorted([...sources]),
  };
}

export function mergeFilterOptions(
  sample: JobsFilterOptions,
  profile: {
    countryName?: string | null;
    stateName?: string | null;
    cityName?: string | null;
    workMode?: string | null;
    employmentType?: string | null;
  }
): JobsFilterOptions {
  const profileCountry = profile.countryName?.trim() ?? "";
  const profileState = profile.stateName?.trim() ?? "";
  const profileCity = profile.cityName?.trim() ?? "";

  const locations = [...sample.locations];

  if (profileCountry || profileState || profileCity) {
    locations.push({
      country: profileCountry,
      state: profileState,
      city: profileCity,
    });
  }

  const countries = uniqueSorted([
    ...sample.countries,
    profileCountry,
  ]);

  const states = uniqueSorted([...sample.states, profileState]);

  const cities = uniqueSorted([...sample.cities, profileCity]);

  const workModes = uniqueSorted([
    ...sample.workModes,
    ...(profile.workMode && profile.workMode !== "any"
      ? [
          profile.workMode.charAt(0).toUpperCase() +
            profile.workMode.slice(1).toLowerCase(),
        ]
      : []),
  ]);

  const employmentTypes = uniqueSorted([
    ...sample.employmentTypes,
    profile.employmentType?.trim() ?? "",
  ]);

  return {
    countries,
    states,
    cities,
    locations,
    workModes,
    employmentTypes,
    workRightsRisks: sample.workRightsRisks,
    sources: sample.sources,
  };
}

export function buildProfileFilterDefaults(profile: {
  country_name?: string | null;
  state_name?: string | null;
  city_name?: string | null;
  work_mode?: string | null;
  employment_type?: string | null;
}): JobsFilterDefaults {
  return {
    country: profile.country_name?.trim() || "any",
    state: profile.state_name?.trim() || "any",
    city: profile.city_name?.trim() || "any",
    workMode: profile.work_mode?.trim() || "any",
    employmentType: profile.employment_type?.trim() || "any",
    workRights: "any",
  };
}

export function buildAdzunaWhereFromFilters(
  country?: string | null,
  state?: string | null,
  city?: string | null
) {
  if (city && city !== "any") {
    return city;
  }

  if (state && state !== "any") {
    return state;
  }

  if (country && country !== "any") {
    return country;
  }

  return undefined;
}

export function getStatesForCountry(
  locations: JobsLocationOption[],
  country: string
) {
  if (country === "any") {
    return uniqueSorted(locations.map((entry) => entry.state));
  }

  return uniqueSorted(
    locations
      .filter((entry) => entry.country === country)
      .map((entry) => entry.state)
  );
}

export function getCitiesForState(
  locations: JobsLocationOption[],
  country: string,
  state: string
) {
  return uniqueSorted(
    locations
      .filter((entry) => {
        const matchesCountry = country === "any" || entry.country === country;
        const matchesState = state === "any" || entry.state === state;

        return matchesCountry && matchesState;
      })
      .map((entry) => entry.city)
  );
}

export function getEmploymentTypeLabel(value: string) {
  if (value === "any") return "Any";
  if (value === "not_listed") return "Not listed";

  return (
    employmentTypeOptions.find((option) => option.value === value)?.label ??
    value
  );
}

export function getWorkModeLabel(value: string) {
  if (value === "any") return "Any";

  const normalized = value.toLowerCase();

  return (
    workModeOptions.find((option) => option.value === normalized)?.label ??
    value
  );
}

export function getWorkRightsRiskLabel(value: string) {
  if (value === "any") return "Any";

  return value;
}
