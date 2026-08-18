import { describe, expect, it } from "vitest";

import type { ProfileSnapshot } from "@/hooks/use-current-user";
import {
  hasCompletedOnboarding,
  needsOnboarding,
} from "@/lib/profile/onboarding";

function createProfile(
  overrides: Partial<ProfileSnapshot> = {}
): ProfileSnapshot {
  return {
    fullName: "Jane Doe",
    email: "jane@example.com",
    countryCode: "AU",
    countryName: "Australia",
    stateCode: "NSW",
    stateName: "NSW",
    cityName: "Sydney",
    workMode: "hybrid",
    employmentType: "full_time",
    workRights: "full_time_allowed",
    targetRoles: ["QA Tester"],
    skills: ["JIRA"],
    resumePath: "",
    resumeFilename: "",
    resumeUploadedAt: null,
    onboardingCompletedAt: null,
    ...overrides,
  };
}

describe("onboarding helpers", () => {
  it("detects completed onboarding", () => {
    const completed = createProfile({
      onboardingCompletedAt: "2026-08-01T00:00:00.000Z",
    });

    expect(hasCompletedOnboarding(completed)).toBe(true);
    expect(needsOnboarding(completed)).toBe(false);
  });

  it("flags profiles that still need onboarding", () => {
    const incomplete = createProfile();

    expect(hasCompletedOnboarding(incomplete)).toBe(false);
    expect(needsOnboarding(incomplete)).toBe(true);
  });
});
