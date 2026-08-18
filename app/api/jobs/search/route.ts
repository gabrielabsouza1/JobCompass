import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { buildAdzunaWhatFromQueryAndRoles } from "@/lib/jobs/build-adzuna-search-query";
import {
  buildAdzunaWhereFromFilters,
  buildProfileFilterDefaults,
  extractFilterOptionsFromJobs,
  mergeFilterOptions,
  parseWorkModeFilter,
} from "@/lib/jobs/extract-filter-options";
import { buildFilteredJobPage } from "@/lib/jobs/filtered-job-catalog";
import { getAdzunaJobs } from "@/lib/jobs/providers/adzuna-provider";
import {
  parseSkillsFromProfile,
} from "@/lib/profile/skills";
import { targetRolesFromProfileValue } from "@/lib/profile/target-roles";
import {
  getAdzunaCodeFromCountryName,
  getAdzunaCountryByName,
} from "@/lib/jobs/adzuna-countries";
import { jobMatchesSelectedInAppSources } from "@/lib/jobs/source-registry";

async function searchAdzunaJobs(
  countryCode: string,
  filters: {
    query: string;
    targetRoles: string[];
    country: string | null;
    state: string | null;
    city: string | null;
    workMode: string | null;
    page: number;
    perPage: number;
  }
) {
  const { what, whatOr } = buildAdzunaWhatFromQueryAndRoles(
    filters.query,
    filters.targetRoles
  );
  const where = buildAdzunaWhereFromFilters(
    filters.country,
    filters.state,
    filters.city
  );

  let resolvedWhat = what;
  const workModes = parseWorkModeFilter(filters.workMode ?? "");

  if (workModes.includes("remote") && !resolvedWhat && !whatOr) {
    resolvedWhat = "remote";
  }

  return getAdzunaJobs({
    countryCode,
    what: resolvedWhat,
    whatOr,
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
  const targetRolesParam = searchParams.get("targetRoles");
  const skillsParam = searchParams.get("skills");
  const source = searchParams.get("source");
  const sortParam = searchParams.get("sort");
  const sortBy =
    sortParam === "date_posted" ? "date_posted" : "best_match";
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
      "country_code, country_name, state_name, city_name, work_mode, employment_type, work_rights, target_roles, skills"
    )
    .eq("id", user.id)
    .single();

  let resolvedProfile = profile;

  if (profileError) {
    const missingSkillsColumn =
      profileError.message?.includes("skills") ||
      profileError.details?.includes("skills");

    if (missingSkillsColumn) {
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from("profiles")
        .select(
          "country_code, country_name, state_name, city_name, work_mode, employment_type, work_rights, target_roles"
        )
        .eq("id", user.id)
        .single();

      if (fallbackError) {
        console.error(fallbackError);

        return NextResponse.json(
          { error: "Could not load user profile" },
          { status: 500 }
        );
      }

      resolvedProfile = {
        ...fallbackProfile,
        skills: [],
      };
    } else {
      const missingTargetRolesColumn =
        profileError.message?.includes("target_roles") ||
        profileError.details?.includes("target_roles");

      if (missingTargetRolesColumn) {
        const { data: fallbackProfile, error: fallbackError } = await supabase
          .from("profiles")
          .select(
            "country_code, country_name, state_name, city_name, work_mode, employment_type, work_rights, skills"
          )
          .eq("id", user.id)
          .single();

        if (fallbackError) {
          console.error(fallbackError);

          return NextResponse.json(
            { error: "Could not load user profile" },
            { status: 500 }
          );
        }

        resolvedProfile = {
          ...fallbackProfile,
          target_roles: [],
        };
      } else {
        console.error(profileError);

        return NextResponse.json(
          { error: "Could not load user profile" },
          { status: 500 }
        );
      }
    }
  }

  if (!resolvedProfile) {
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
  const profileCountryCode = resolvedProfile.country_code || "AU";
  const adzunaCountryCode = resolveAdzunaCountryCode(country, profileCountryCode);
  const profileDefaults = buildProfileFilterDefaults(resolvedProfile);

  const hasTargetRolesParam = searchParams.has("targetRoles");
  const profileTargetRoles = targetRolesFromProfileValue(
    resolvedProfile.target_roles
  );
  const activeTargetRoles = hasTargetRolesParam
    ? (targetRolesParam ?? "")
        .split("|")
        .map((role) => role.trim())
        .filter(Boolean)
    : profileTargetRoles;

  const hasSkillsParam = searchParams.has("skills");
  const activeSkills = hasSkillsParam
    ? (skillsParam ?? "")
        .split("|")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const adzunaSearchFilters = {
    query,
    targetRoles: activeTargetRoles,
    country,
    state,
    city,
    workMode,
  };

  const jobFilterOptions = {
    selectedSourceIds,
    source,
    workMode,
    employmentType,
    workRights,
    skills: activeSkills,
  };

  const profileMatchContext = {
    countryName: resolvedProfile.country_name ?? "",
    stateName: resolvedProfile.state_name ?? "",
    cityName: resolvedProfile.city_name ?? "",
    workMode: resolvedProfile.work_mode ?? "",
    employmentType: resolvedProfile.employment_type ?? "",
    workRights: resolvedProfile.work_rights ?? "",
    skills: parseSkillsFromProfile(resolvedProfile.skills),
  };

  const catalogPage = await buildFilteredJobPage(
    (adzunaPage, batchSize) =>
      searchAdzunaJobs(adzunaCountryCode, {
        ...adzunaSearchFilters,
        page: adzunaPage,
        perPage: batchSize,
      }),
    jobFilterOptions,
    profileMatchContext,
    activeTargetRoles,
    page,
    perPage,
    sortBy
  );

  const { jobs: sampleJobs } = await searchAdzunaJobs(adzunaCountryCode, {
    query,
    targetRoles: [],
    country: null,
    state: null,
    city: null,
    workMode: null,
    page: 1,
    perPage: 50,
  });

  const sampleAfterSources = sampleJobs.filter((job) =>
    jobMatchesSelectedInAppSources(job.source, selectedSourceIds)
  );

  const filterOptions = mergeFilterOptions(
    extractFilterOptionsFromJobs(sampleAfterSources),
    {
      countryName: resolvedProfile.country_name,
      stateName: resolvedProfile.state_name,
      cityName: resolvedProfile.city_name,
      workMode: resolvedProfile.work_mode,
      employmentType: resolvedProfile.employment_type,
    }
  );

  return NextResponse.json({
    jobs: catalogPage.jobs,
    total: catalogPage.total,
    page: catalogPage.page,
    perPage: catalogPage.perPage,
    totalPages: catalogPage.totalPages,
    defaults: profileDefaults,
    filters: filterOptions,
  });
}
