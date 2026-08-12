import {
  targetRolesFromProfileValue,
} from "@/lib/profile/target-roles";
import type { Job } from "@/types";
import {
  employmentTypeOptions,
  workModeOptions,
  workRightsOptions,
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
  targetRoles: string[];
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export const ALL_WORK_MODE_VALUES = ["remote", "hybrid", "onsite"] as const;

export const ALL_EMPLOYMENT_TYPE_VALUES = employmentTypeOptions
  .filter((option) => option.value !== "any")
  .map((option) => option.value);

export const ALL_WORK_RIGHTS_VALUES = workRightsOptions.map(
  (option) => option.value
);

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
  work_rights?: string | null;
  target_roles?: string[] | null;
}): JobsFilterDefaults {
  return {
    country: profile.country_name?.trim() || "any",
    state: profile.state_name?.trim() || "any",
    city: profile.city_name?.trim() || "any",
    workMode: profile.work_mode?.trim() || "any",
    employmentType: profile.employment_type?.trim() || "any",
    workRights: profile.work_rights?.trim() || "any",
    targetRoles: targetRolesFromProfileValue(profile.target_roles),
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

  return undefined;
}

function isValidLocationPart(value: string, country: string) {
  const normalized = value.trim().toLowerCase();
  const normalizedCountry = country.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (normalized === normalizedCountry) {
    return false;
  }

  if (
    normalizedCountry === "united kingdom" &&
    (normalized === "uk" ||
      normalized === "united kingdom" ||
      normalized === "great britain")
  ) {
    return false;
  }

  if (
    normalizedCountry === "united states" &&
    (normalized === "us" ||
      normalized === "usa" ||
      normalized === "united states")
  ) {
    return false;
  }

  return true;
}

export function getStatesForCountry(
  locations: JobsLocationOption[],
  country: string
) {
  if (country === "any") {
    return uniqueSorted(
      locations.map((entry) => entry.state).filter((state) => state.trim())
    );
  }

  return uniqueSorted(
    locations
      .filter(
        (entry) =>
          entry.country === country &&
          isValidLocationPart(entry.state, country)
      )
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

        return (
          matchesCountry &&
          matchesState &&
          isValidLocationPart(entry.city, country)
        );
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

export function getWorkRightsLabel(value: string) {
  if (!value || value === "any") return "Any";

  return (
    workRightsOptions.find((option) => option.value === value)?.label ?? value
  );
}

export function getWorkRightsRiskLabel(value: string) {
  if (value === "any") return "Any";

  const normalized = value.toLowerCase();

  if (normalized === "low") return "Low";
  if (normalized === "medium") return "Medium";
  if (normalized === "high") return "High";

  return value;
}

export function formatLocationFilterLabel(
  city: string,
  state: string,
  country: string
) {
  if (city && city !== "any") {
    return country && country !== "any" ? `${city}, ${country}` : city;
  }

  if (state && state !== "any") {
    return country && country !== "any" ? `${state}, ${country}` : state;
  }

  if (country && country !== "any") {
    return country;
  }

  return "Any location";
}

export function parseMultiFilter(value: string) {
  if (!value || value === "any") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function serializeMultiFilter(
  values: string[],
  allValues: readonly string[]
) {
  const normalized = values.map((value) => value.toLowerCase());

  if (normalized.length === 0) {
    return "any";
  }

  const allSelected = allValues.every((value) =>
    normalized.includes(value.toLowerCase())
  );

  if (allSelected) {
    return "any";
  }

  return normalized.join(",");
}

export function workModesFromProfileValue(value?: string | null) {
  if (!value || value === "any") {
    return [...ALL_WORK_MODE_VALUES];
  }

  return [value.toLowerCase()];
}

export function employmentTypesFromProfileValue(value?: string | null) {
  if (!value || value === "any") {
    return [...ALL_EMPLOYMENT_TYPE_VALUES];
  }

  return [jobEmploymentTypeToFilterValue(value)];
}

export function isJobCompatibleWithWorkRight(job: Job, workRight: string) {
  const normalized = workRight.toLowerCase().trim();
  const risk = job.workRightsRisk;

  if (risk === "Low") {
    return true;
  }

  if (risk === "Medium") {
    return (
      normalized === "full_time_allowed" || normalized === "citizen_or_pr"
    );
  }

  if (risk === "High") {
    return normalized === "citizen_or_pr";
  }

  return true;
}

export function workRightsFromProfileValue(value?: string | null) {
  if (!value || value === "any") {
    return [...ALL_WORK_RIGHTS_VALUES];
  }

  return [value];
}

export function parseWorkModeFilter(value: string) {
  return parseMultiFilter(value);
}

export function serializeWorkModeFilter(modes: string[]) {
  return serializeMultiFilter(modes, ALL_WORK_MODE_VALUES);
}

export function parseEmploymentTypeFilter(value: string) {
  return parseMultiFilter(value);
}

export function serializeEmploymentTypeFilter(types: string[]) {
  return serializeMultiFilter(types, ALL_EMPLOYMENT_TYPE_VALUES);
}

export function parseWorkRightsFilter(value: string) {
  return parseMultiFilter(value);
}

export function serializeWorkRightsFilter(workRights: string[]) {
  return serializeMultiFilter(workRights, ALL_WORK_RIGHTS_VALUES);
}
