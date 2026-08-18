import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { parseSkillsFromProfile, uniqueSkills } from "@/lib/profile/skills";
import { recordSkillUsage } from "@/lib/skills/record-skill-usage";
import { normalizedSkillName } from "@/lib/skills/skill-catalog";
import { parseTargetRolesFromProfile, uniqueTargetRoles } from "@/lib/profile/target-roles";
import { createClient } from "@/lib/supabase/server";

type ProfileUpdateBody = {
  fullName?: string;
  countryCode?: string;
  countryName?: string;
  stateCode?: string;
  stateName?: string;
  cityName?: string;
  workMode?: string;
  employmentType?: string;
  workRights?: string;
  targetRoles?: string[];
  skills?: string[];
  onboardingCompleted?: boolean;
  clearResume?: boolean;
};

const PROFILE_SELECT_FULL =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights, target_roles, skills, resume_path, resume_filename, resume_uploaded_at, onboarding_completed_at";

const PROFILE_SELECT_LEGACY =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights, target_roles, skills";

const PROFILE_SELECT_WITHOUT_RESUME =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights, target_roles, skills, onboarding_completed_at";

const PROFILE_SELECT_WITHOUT_SKILLS =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights, target_roles";

const PROFILE_SELECT_WITHOUT_TARGET_ROLES =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights";

const PROFILE_SELECT_BASE =
  "full_name, email, country_code, country_name, state_code, state_name, city_name, work_mode, employment_type, work_rights";

const PROFILE_SELECT_VARIANTS: string[] = [
  PROFILE_SELECT_FULL,
  PROFILE_SELECT_WITHOUT_RESUME,
  PROFILE_SELECT_LEGACY,
  PROFILE_SELECT_WITHOUT_SKILLS,
  PROFILE_SELECT_WITHOUT_TARGET_ROLES,
  PROFILE_SELECT_BASE,
];

export const dynamic = "force-dynamic";

function omitProfileFields(
  updatePayload: Record<string, string | string[] | null>,
  keys: string[]
) {
  return Object.fromEntries(
    Object.entries(updatePayload).filter(([key]) => !keys.includes(key))
  ) as Record<string, string | string[] | null>;
}

function buildProfileUpdate(body: ProfileUpdateBody) {
  const update: Record<string, string | string[] | null> = {};

  if (body.fullName !== undefined) {
    update.full_name = body.fullName.trim();
  }

  if (body.countryCode !== undefined) {
    update.country_code = body.countryCode;
  }

  if (body.countryName !== undefined) {
    update.country_name = body.countryName;
  }

  if (body.stateCode !== undefined) {
    update.state_code = body.stateCode;
  }

  if (body.stateName !== undefined) {
    update.state_name = body.stateName;
  }

  if (body.cityName !== undefined) {
    update.city_name = body.cityName;
  }

  if (body.workMode !== undefined) {
    update.work_mode = body.workMode;
  }

  if (body.employmentType !== undefined) {
    update.employment_type = body.employmentType;
  }

  if (body.workRights !== undefined) {
    update.work_rights = body.workRights;
  }

  if (body.targetRoles !== undefined) {
    update.target_roles = uniqueTargetRoles(body.targetRoles);
  }

  if (body.skills !== undefined) {
    update.skills = uniqueSkills(body.skills);
  }

  if (body.onboardingCompleted === true) {
    update.onboarding_completed_at = new Date().toISOString();
  }

  if (body.clearResume === true) {
    update.resume_path = "";
    update.resume_filename = "";
    update.resume_uploaded_at = null;
  }

  return update;
}

function getNewlyAddedSkills(previousSkills: string[], nextSkills: string[]) {
  const previous = new Set(previousSkills.map((skill) => normalizedSkillName(skill)));

  return nextSkills.filter(
    (skill) => !previous.has(normalizedSkillName(skill))
  );
}

function mapProfileRow(
  profile: Record<string, unknown> | null,
  authEmail: string
) {
  return {
    fullName: (profile?.full_name as string | undefined) ?? "",
    email: (profile?.email as string | undefined) ?? authEmail,
    countryCode: (profile?.country_code as string | undefined) ?? "",
    countryName: (profile?.country_name as string | undefined) ?? "",
    stateCode: (profile?.state_code as string | undefined) ?? "",
    stateName: (profile?.state_name as string | undefined) ?? "",
    cityName: (profile?.city_name as string | undefined) ?? "",
    workMode: (profile?.work_mode as string | undefined) ?? "",
    employmentType: (profile?.employment_type as string | undefined) ?? "",
    workRights: (profile?.work_rights as string | undefined) ?? "",
    targetRoles: parseTargetRolesFromProfile(profile?.target_roles),
    skills: parseSkillsFromProfile(profile?.skills),
    resumePath: (profile?.resume_path as string | undefined) ?? "",
    resumeFilename: (profile?.resume_filename as string | undefined) ?? "",
    resumeUploadedAt:
      (profile?.resume_uploaded_at as string | undefined) ?? null,
    onboardingCompletedAt:
      (profile?.onboarding_completed_at as string | undefined) ?? null,
  };
}

function isMissingColumnError(error: { message?: string; details?: string }, column: string) {
  return (
    error.message?.includes(column) || error.details?.includes(column)
  );
}

function looksLikeMissingColumnError(error: { message?: string; details?: string }) {
  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

  return (
    message.includes("column") ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
}

async function loadProfileForUser(userId: string, authEmail: string) {
  const supabase = await createClient();
  let lastError: { message?: string; details?: string } | null = null;

  for (const select of PROFILE_SELECT_VARIANTS) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(select)
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      return mapProfileRow(
        profile as Record<string, unknown> | null,
        authEmail
      );
    }

    lastError = error;

    if (!looksLikeMissingColumnError(error)) {
      throw error;
    }
  }

  throw lastError ?? new Error("Could not load profile");
}

function enrichProfileFromUpdate(
  profile: ReturnType<typeof mapProfileRow>,
  updatePayload: Record<string, string | string[] | null>,
  body: ProfileUpdateBody
) {
  const enriched = { ...profile };

  if (
    body.onboardingCompleted === true &&
    !enriched.onboardingCompletedAt &&
    typeof updatePayload.onboarding_completed_at === "string"
  ) {
    enriched.onboardingCompletedAt = updatePayload.onboarding_completed_at;
  }

  if (body.clearResume === true) {
    enriched.resumePath = "";
    enriched.resumeFilename = "";
    enriched.resumeUploadedAt = null;
  }

  return enriched;
}

async function buildProfileResponseAfterUpdate(
  userId: string,
  authEmail: string,
  updatePayload: Record<string, string | string[] | null>,
  body: ProfileUpdateBody,
  previousSkills: string[]
) {
  const profile = await loadProfileForUser(userId, authEmail);
  const enrichedProfile = enrichProfileFromUpdate(profile, updatePayload, body);

  if (updatePayload.skills) {
    const addedSkills = getNewlyAddedSkills(previousSkills, enrichedProfile.skills);
    await recordSkillUsage(addedSkills);
  }

  return enrichedProfile;
}

export async function GET() {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  try {
    const profile = await loadProfileForUser(user.id, user.email ?? "");

    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  let body: ProfileUpdateBody;

  try {
    body = (await request.json()) as ProfileUpdateBody;
  } catch {
    return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
  }

  const updatePayload = buildProfileUpdate(body);

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "No profile fields to update" }, { status: 400 });
  }

  const supabase = await createClient();
  let previousSkills: string[] = [];

  if (updatePayload.skills) {
    try {
      const currentProfile = await loadProfileForUser(user.id, user.email ?? "");
      previousSkills = currentProfile.skills;
    } catch (error) {
      console.error(error);
    }
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id)
    .select(PROFILE_SELECT_LEGACY)
    .maybeSingle();

  if (updateError) {
    const missingResumeColumn =
      isMissingColumnError(updateError, "resume_path") ||
      isMissingColumnError(updateError, "onboarding_completed_at");

    if (missingResumeColumn) {
      const rest = omitProfileFields(updatePayload, [
        "resume_path",
        "resume_filename",
        "resume_uploaded_at",
        "onboarding_completed_at",
      ]);

      if (Object.keys(rest).length > 0) {
        const { data: partialProfile, error: partialError } = await supabase
          .from("profiles")
          .update(rest)
          .eq("id", user.id)
          .select(PROFILE_SELECT_LEGACY)
          .maybeSingle();

        if (partialError) {
          console.error(partialError);

          return NextResponse.json({ error: partialError.message }, { status: 500 });
        }

        if (partialProfile) {
          return NextResponse.json({
            profile: mapProfileRow(partialProfile, user.email ?? ""),
            warning:
              "Resume and onboarding fields are missing. Run the resume/onboarding migration in Supabase.",
          });
        }
      }

      return NextResponse.json({
        error:
          "Resume and onboarding columns are missing. Run the resume/onboarding migration in Supabase.",
      }, { status: 400 });
    }

    const missingSkillsColumn = isMissingColumnError(updateError, "skills");

    if (missingSkillsColumn && updatePayload.skills) {
      const rest = omitProfileFields(updatePayload, ["skills"]);

      if (Object.keys(rest).length > 0) {
        const { error: partialError } = await supabase
          .from("profiles")
          .update(rest)
          .eq("id", user.id);

        if (partialError) {
          console.error(partialError);

          return NextResponse.json({ error: partialError.message }, { status: 500 });
        }
      }

      return NextResponse.json({
        error:
          "The skills column is missing. Run the skills migration in Supabase.",
        savedSkills: false,
      }, { status: 400 });
    }

    const missingTargetRolesColumn = isMissingColumnError(updateError, "target_roles");

    if (missingTargetRolesColumn && updatePayload.target_roles) {
      const rest = omitProfileFields(updatePayload, ["target_roles"]);

      if (Object.keys(rest).length > 0) {
        const { error: partialError } = await supabase
          .from("profiles")
          .update(rest)
          .eq("id", user.id);

        if (partialError) {
          console.error(partialError);

          return NextResponse.json({ error: partialError.message }, { status: 500 });
        }
      }

      return NextResponse.json({
        error:
          "The target_roles column is missing. Run the target_roles migration in Supabase.",
        savedTargetRoles: false,
      }, { status: 400 });
    }

    console.error(updateError);

    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (updatedProfile) {
    try {
      const profile = await buildProfileResponseAfterUpdate(
        user.id,
        user.email ?? "",
        updatePayload,
        body,
        previousSkills
      );

      return NextResponse.json({ profile });
    } catch (reloadError) {
      console.error(reloadError);

      return NextResponse.json({
        profile: enrichProfileFromUpdate(
          mapProfileRow(updatedProfile as Record<string, unknown>, user.email ?? ""),
          updatePayload,
          body
        ),
      });
    }
  }

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("id", user.id);

  if (countError) {
    console.error(countError);

    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count && count > 0) {
    try {
      const profile = await buildProfileResponseAfterUpdate(
        user.id,
        user.email ?? "",
        updatePayload,
        body,
        previousSkills
      );

      return NextResponse.json({ profile });
    } catch (reloadError) {
      console.error(reloadError);

      return NextResponse.json(
        { error: "Profile updated but could not be reloaded" },
        { status: 500 }
      );
    }
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      ...updatePayload,
    })
    .select(PROFILE_SELECT_LEGACY)
    .maybeSingle();

  if (insertError) {
    console.error(insertError);

    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (!insertedProfile) {
    return NextResponse.json(
      {
        error:
          "Profile save was blocked. Run the profiles RLS migration in Supabase.",
      },
      { status: 403 }
    );
  }

  if (updatePayload.skills) {
    const nextSkills = parseSkillsFromProfile(insertedProfile.skills);
    const addedSkills = getNewlyAddedSkills(previousSkills, nextSkills);
    await recordSkillUsage(addedSkills);
  }

  try {
    const profile = await buildProfileResponseAfterUpdate(
      user.id,
      user.email ?? "",
      updatePayload,
      body,
      previousSkills
    );

    return NextResponse.json({ profile });
  } catch (reloadError) {
    console.error(reloadError);
  }

  return NextResponse.json({
    profile: enrichProfileFromUpdate(
      mapProfileRow(insertedProfile as Record<string, unknown>, user.email ?? ""),
      updatePayload,
      body
    ),
  });
}
