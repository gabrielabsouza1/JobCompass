import { NextResponse } from "next/server";
import { getMockJobs } from "@/lib/jobs/providers/mock-provider";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";

export async function GET() {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const supabase = await import("@/lib/supabase/server").then((module) =>
    module.createClient()
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "country_name, state_name, city_name, work_mode, employment_type, work_rights"
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

  const jobs = await getMockJobs();
  
  const visibleJobs = jobs.filter((job) =>
    selectedSourceIds.some((sourceId) =>
      job.source.toLowerCase().includes(sourceId.toLowerCase())
    )
  );

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
  });
}