import { describe, expect, it } from "vitest";

import {
  calculateProfileCompletion,
  getProfileCompletionItems,
} from "@/lib/profile/calculate-profile-completion";

describe("calculateProfileCompletion", () => {
  it("marks incomplete profiles with partial progress", () => {
    expect(
      calculateProfileCompletion({
        countryName: "Australia",
        cityName: "Sydney",
        workMode: "hybrid",
        targetRoles: ["QA Tester"],
        skills: ["JIRA"],
      })
    ).toBe(50);
  });

  it("returns 100 for a fully completed profile", () => {
    expect(
      calculateProfileCompletion({
        countryName: "Australia",
        cityName: "Sydney",
        workMode: "hybrid",
        employmentType: "full_time",
        workRights: "full_time_allowed",
        targetRoles: ["QA Tester"],
        skills: ["JIRA", "SQL Basics", "Manual Testing"],
        resumeFilename: "resume.pdf",
      })
    ).toBe(100);
  });

  it("exposes weighted completion items", () => {
    const items = getProfileCompletionItems({
      countryName: "Australia",
      cityName: "Sydney",
    });

    expect(items.find((item) => item.label === "Location")?.complete).toBe(
      true
    );
    expect(items.find((item) => item.label === "Resume")?.complete).toBe(false);
  });
});
