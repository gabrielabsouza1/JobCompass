import { NextRequest, NextResponse } from "next/server";
import { getMockJobs } from "@/lib/jobs/providers/mock-provider";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";
import { getAdzunaJobs } from "@/lib/jobs/providers/adzuna-provider";

async function getAdzunaJobsWithFallback(
  profile: {
    country_code: string | null;
    country_name: string | null;
    state_name: string | null;
    city_name: string | null;
    work_mode: string | null;
  },
  filters: {
    query: string;
    location: string | null;
    workMode: string | null;
  }
) {
  const countryCode = profile.country_code || "AU";
  const searchTerm = filters.query || "qa tester";

  const selectedLocation =
    filters.location && filters.location !== "any" ? filters.location : null;

  const locationAttempts = selectedLocation
    ? [selectedLocation, profile.state_name, ""]
    : [profile.city_name, profile.state_name, ""]
      .filter((location) => location !== null) as string[];

  for (const location of locationAttempts) {
    const jobs = await getAdzunaJobs({
      countryCode,
      what: searchTerm,
      where: location ?? undefined,
      resultsPerPage: 10,
    });

    if (jobs.length > 0) {
      return {
        jobs,
        fallbackMessage:
          location === selectedLocation || location === profile.city_name
            ? ""
            : location
              ? `No jobs found in ${selectedLocation || profile.city_name}. Showing jobs from ${location} instead.`
              : `No jobs found in ${selectedLocation || profile.city_name || profile.state_name}. Showing jobs from your country instead.`,
      };
    }
  }

  const selectedWorkMode = filters.workMode || profile.work_mode;
  const normalizedWorkMode = selectedWorkMode?.toLowerCase();

  if (normalizedWorkMode === "remote" || normalizedWorkMode === "any") {
    const remoteJobs = await getAdzunaJobs({
      countryCode,
      what: `${searchTerm} remote`,
      where: undefined,
      resultsPerPage: 10,
    });

    if (remoteJobs.length > 0) {
      return {
        jobs: remoteJobs,
        fallbackMessage:
          "No local jobs found. Showing remote jobs that may match your filters.",
      };
    }
  }

  return {
    jobs: [],
    fallbackMessage:
      "No jobs found for your current filters. Try changing your location or work preferences.",
  };
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);

  const query = searchParams.get("query") || "qa tester";
  const location = searchParams.get("location");
  const workMode = searchParams.get("workMode");
  const employmentType = searchParams.get("employmentType");
  const workRights = searchParams.get("workRights");

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

  const mockJobs = await getMockJobs();

  const {
    jobs: adzunaJobs,
    fallbackMessage,
  } = await getAdzunaJobsWithFallback(profile, {
    query,
    location,
    workMode,
  });

  const jobs = [...adzunaJobs, ...mockJobs];

  const sourceFilteredJobs = jobs.filter((job) =>
    selectedSourceIds.some((sourceId) =>
      job.source.toLowerCase().includes(sourceId.toLowerCase())
    )
  );

  const visibleJobs = sourceFilteredJobs.filter((job) => {
    const matchesWorkMode =
      !workMode ||
      workMode === "any" ||
      job.workMode.toLowerCase() === workMode.toLowerCase();

    const matchesEmploymentType =
      !employmentType ||
      employmentType === "any" ||
      job.employmentType.toLowerCase().replace("-", "_") ===
      employmentType.toLowerCase();

    const matchesWorkRights =
      !workRights ||
      workRights === "any" ||
      job.workRightsRisk.toLowerCase() !== "high";

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

  return NextResponse.json({
    jobs: matchedJobs,
    total: matchedJobs.length,
    fallbackMessage,
  });
}