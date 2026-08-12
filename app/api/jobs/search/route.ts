import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";
import {
  employmentTypesFromProfileValue,
  isJobCompatibleWithWorkRight,
  parseEmploymentTypeFilter,
  parseWorkModeFilter,
  parseWorkRightsFilter,
  jobEmploymentTypeToFilterValue,
  buildAdzunaWhereFromFilters,
  buildProfileFilterDefaults,
  extractFilterOptionsFromJobs,
  mergeFilterOptions,
} from "@/lib/jobs/extract-filter-options";
import { getAdzunaJobs } from "@/lib/jobs/providers/adzuna-provider";
import {
  getAdzunaCodeFromCountryName,
  getAdzunaCountryByName,
} from "@/lib/jobs/adzuna-countries";

async function searchAdzunaJobs(
  countryCode: string,
  filters: {
    query: string;
    country: string | null;
    state: string | null;
    city: string | null;
    workMode: string | null;
    page: number;
    perPage: number;
  }
) {
  const searchTerm = filters.query.trim();
  const where = buildAdzunaWhereFromFilters(
    filters.country,
    filters.state,
    filters.city
  );

  let what = searchTerm || undefined;

  const workModes = parseWorkModeFilter(filters.workMode ?? "");

  if (workModes.includes("remote") && !what) {
    what = "remote";
  }

  return getAdzunaJobs({
    countryCode,
    what,
    where,
    resultsPerPage: filters.perPage,
    page: filters.page,
  });
}

function resolveAdzunaCountryCode(
  countryFilter: string | null,
  profileCountryCode: string
) {
  if (countryFilter && countryFilter !== "any") {
    const adzunaCountry = getAdzunaCountryByName(countryFilter);

    return adzunaCountry?.code ?? getAdzunaCodeFromCountryName(countryFilter);
  }

  return profileCountryCode.toLowerCase();
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query")?.trim() ?? "";
  const country = searchParams.get("country");
  const state = searchParams.get("state");
  const city = searchParams.get("city");
  const workMode = searchParams.get("workMode");
  const employmentType = searchParams.get("employmentType");
  const workRights = searchParams.get("workRights");
  const source = searchParams.get("source");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, Number(searchParams.get("perPage")) || 10)
  );

  const supabase = await import("@/lib/supabase/server").then((module) =>
    module.createClient()
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "country_code, country_name, state_name, city_name, work_mode, employment_type, work_rights"
    )
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError);

    return NextResponse.json(
      { error: "Could not load user profile" },
      { status: 500 }
    );
  }

  const { data: userSources, error: sourcesError } = await supabase
    .from("user_sources")
    .select("source_id")
    .eq("user_id", user.id);

  if (sourcesError) {
    console.error(sourcesError);

    return NextResponse.json(
      { error: "Could not load user sources" },
      { status: 500 }
    );
  }

  const selectedSourceIds = userSources.map((source) => source.source_id);
  const profileCountryCode = profile.country_code || "AU";
  const adzunaCountryCode = resolveAdzunaCountryCode(country, profileCountryCode);
  const profileDefaults = buildProfileFilterDefaults(profile);

  const { jobs: adzunaJobs, total: adzunaTotal } = await searchAdzunaJobs(
    adzunaCountryCode,
    {
      query,
      country,
      state,
      city,
      workMode,
      page,
      perPage,
    }
  );

  const { jobs: sampleJobs } = await searchAdzunaJobs(adzunaCountryCode, {
    query,
    country: null,
    state: null,
    city: null,
    workMode: null,
    page: 1,
    perPage: 50,
  });

  const sampleAfterSources = sampleJobs.filter((job) =>
    selectedSourceIds.some((sourceId) =>
      job.source.toLowerCase().includes(sourceId.toLowerCase())
    )
  );

  const filterOptions = mergeFilterOptions(
    extractFilterOptionsFromJobs(sampleAfterSources),
    {
      countryName: profile.country_name,
      stateName: profile.state_name,
      cityName: profile.city_name,
      workMode: profile.work_mode,
      employmentType: profile.employment_type,
    }
  );

  const sourceFilteredJobs = adzunaJobs.filter((job) =>
    selectedSourceIds.some((sourceId) =>
      job.source.toLowerCase().includes(sourceId.toLowerCase())
    )
  );

  const sourceScopedJobs =
    source && source !== "any"
      ? sourceFilteredJobs.filter(
          (job) => job.source.toLowerCase() === source.toLowerCase()
        )
      : sourceFilteredJobs;

  const visibleJobs = sourceScopedJobs.filter((job) => {
    const workModeFilters = parseWorkModeFilter(workMode ?? "");

    const matchesWorkMode =
      workModeFilters.length === 0 ||
      workModeFilters.includes(job.workMode.toLowerCase());

    const employmentFilters = parseEmploymentTypeFilter(employmentType ?? "");

    const matchesEmploymentType =
      employmentFilters.length === 0 ||
      employmentFilters.includes(
        jobEmploymentTypeToFilterValue(job.employmentType)
      );

    const workRightsFilters = parseWorkRightsFilter(workRights ?? "");

    const matchesWorkRights =
      workRightsFilters.length === 0 ||
      workRightsFilters.some((workRight) =>
        isJobCompatibleWithWorkRight(job, workRight)
      );

    return matchesWorkMode && matchesEmploymentType && matchesWorkRights;
  });

  const matchedJobs = visibleJobs
    .map((job) => ({
      ...job,
      matchScore: calculateMatchScore(job, {
        countryName: profile.country_name ?? "",
        stateName: profile.state_name ?? "",
        cityName: profile.city_name ?? "",
        workMode: profile.work_mode ?? "",
        employmentType: profile.employment_type ?? "",
        workRights: profile.work_rights ?? "",
      }),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const totalPages = Math.ceil(adzunaTotal / perPage);

  return NextResponse.json({
    jobs: matchedJobs,
    total: adzunaTotal,
    page,
    perPage,
    totalPages,
    fallbackMessage: "",
    defaults: profileDefaults,
    filters: filterOptions,
  });
}
