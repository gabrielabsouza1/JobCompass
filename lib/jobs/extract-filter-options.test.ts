import { describe, expect, it } from "vitest";

import { createTestJob } from "@/lib/test/create-test-job";
import {
  buildAdzunaWhereFromFilters,
  buildProfileFilterDefaults,
  formatLocationFilterLabel,
  getCitiesForState,
  getStatesForCountry,
  hasRestrictiveMultiSelection,
  isJobCompatibleWithWorkRight,
  jobEmploymentTypeToFilterValue,
  jobMatchesSearchFilters,
  jobMatchesSkillsFilter,
  parseMultiFilter,
  serializeMultiFilter,
  serializeWorkModeFilter,
} from "@/lib/jobs/extract-filter-options";

describe("extract-filter-options", () => {
  it("maps employment types to filter values", () => {
    expect(jobEmploymentTypeToFilterValue("Full-time")).toBe("full_time");
    expect(jobEmploymentTypeToFilterValue("Not listed")).toBe("not_listed");
  });

  it("builds profile filter defaults with fallbacks", () => {
    expect(
      buildProfileFilterDefaults({
        country_name: "Australia",
        city_name: "Sydney",
        work_mode: "hybrid",
      })
    ).toEqual({
      country: "Australia",
      state: "any",
      city: "Sydney",
      workMode: "hybrid",
      employmentType: "any",
      workRights: "any",
      targetRoles: expect.any(Array),
    });
  });

  it("prefers city over state for Adzuna where filters", () => {
    expect(
      buildAdzunaWhereFromFilters("Australia", "NSW", "Sydney")
    ).toBe("Sydney");
    expect(buildAdzunaWhereFromFilters("Australia", "NSW", "any")).toBe("NSW");
    expect(buildAdzunaWhereFromFilters("Australia", "any", "any")).toBeUndefined();
  });

  it("derives dependent location options from job samples", () => {
    const locations = [
      { country: "Australia", state: "NSW", city: "Sydney" },
      { country: "Australia", state: "VIC", city: "Melbourne" },
    ];

    expect(getStatesForCountry(locations, "Australia")).toEqual(["NSW", "VIC"]);
    expect(getCitiesForState(locations, "Australia", "NSW")).toEqual([
      "Sydney",
    ]);
  });

  it("serializes and parses multi-select filters", () => {
    expect(serializeWorkModeFilter(["remote", "hybrid"])).toBe("remote,hybrid");
    expect(parseMultiFilter("remote,hybrid")).toEqual(["remote", "hybrid"]);
    expect(serializeMultiFilter(["remote", "hybrid", "onsite"], [
      "remote",
      "hybrid",
      "onsite",
    ])).toBe("any");
  });

  it("formats location labels for chips", () => {
    expect(formatLocationFilterLabel("Sydney", "NSW", "Australia")).toBe(
      "Sydney, Australia"
    );
    expect(formatLocationFilterLabel("any", "NSW", "Australia")).toBe(
      "NSW, Australia"
    );
    expect(formatLocationFilterLabel("any", "any", "any")).toBe("Any location");
  });

  it("matches jobs against skills, source, and work rights filters", () => {
    const job = createTestJob({
      source: "Jooble",
      workMode: "Remote",
      workRightsRisk: "High",
      skills: ["JIRA"],
    });

    expect(
      jobMatchesSkillsFilter(job, ["Postman"])
    ).toBe(false);
    expect(
      jobMatchesSkillsFilter(job, ["JIRA"])
    ).toBe(true);
    expect(isJobCompatibleWithWorkRight(job, "student_visa")).toBe(false);
    expect(isJobCompatibleWithWorkRight(job, "citizen_or_pr")).toBe(true);
    expect(
      jobMatchesSearchFilters(job, {
        selectedSourceIds: ["jooble"],
        workMode: "remote",
        workRights: "citizen_or_pr",
      })
    ).toBe(true);
    expect(
      jobMatchesSearchFilters(job, {
        selectedSourceIds: ["adzuna"],
      })
    ).toBe(false);
  });

  it("detects restrictive multi-selection", () => {
    expect(
      hasRestrictiveMultiSelection(["remote"], ["remote", "hybrid", "onsite"])
    ).toBe(true);
    expect(
      hasRestrictiveMultiSelection(
        ["remote", "hybrid", "onsite"],
        ["remote", "hybrid", "onsite"]
      )
    ).toBe(false);
  });
});
