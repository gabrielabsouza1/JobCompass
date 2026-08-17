import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import {
  calculateMatchScore,
  getJobSkillMatchDetails,
} from "@/lib/jobs/calculate-match-score";
import { getAdzunaJobById } from "@/lib/jobs/providers/adzuna-provider";
import { parseSkillsFromProfile } from "@/lib/profile/skills";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "country_code, country_name, state_name, city_name, work_mode, employment_type, work_rights, skills"
    )
    .eq("id", user.id)
    .maybeSingle();

  const job = await getAdzunaJobById(id, profile?.country_code || "AU");

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const profileContext = {
    countryName: profile?.country_name ?? "",
    stateName: profile?.state_name ?? "",
    cityName: profile?.city_name ?? "",
    workMode: profile?.work_mode ?? "",
    employmentType: profile?.employment_type ?? "",
    workRights: profile?.work_rights ?? "",
    skills: parseSkillsFromProfile(profile?.skills),
  };
  const skillMatch = getJobSkillMatchDetails(job, profileContext);

  return NextResponse.json({
    job: {
      ...job,
      matchScore: calculateMatchScore(job, profileContext),
      matchedProfileSkills: skillMatch.matchedSkills,
      missingProfileSkills: skillMatch.missingSkills,
    },
  });
}
