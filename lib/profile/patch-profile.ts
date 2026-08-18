import type { ProfileSnapshot } from "@/hooks/use-current-user";

type PatchProfilePayload = Partial<{
  fullName: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  workMode: string;
  employmentType: string;
  workRights: string;
  targetRoles: string[];
  skills: string[];
  onboardingCompleted: boolean;
  clearResume: boolean;
}>;

type PatchProfileResponse = {
  profile?: ProfileSnapshot;
  error?: string;
};

export async function patchProfile(payload: PatchProfilePayload) {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PatchProfileResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Could not save profile");
  }

  return data.profile ?? null;
}
