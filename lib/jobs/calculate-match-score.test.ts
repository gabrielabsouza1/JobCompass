import { describe, expect, it } from "vitest";

import type { Job } from "@/types";

import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    title: "QA Tester",
    company: "Acme",
    source: "Adzuna",
    sourceType: "api",
    location: "Sydney, NSW, Australia",
    country: "Australia",
    state: "NSW",
    city: "Sydney",
    workMode: "Hybrid",
    employmentType: "Full-time",
    postedAt: "2026-08-01",
    matchScore: 0,
    skills: ["JIRA", "Manual Testing"],
    matchedProfileSkills: [],
    missingProfileSkills: [],
    description: "Manual testing role with JIRA and SQL.",
    url: "https://example.com/job",
    workRightsRisk: "Low",
    ...overrides,
  };
}

describe("calculateMatchScore", () => {
  it("rewards matching location, work mode, employment type, and skills", () => {
    const score = calculateMatchScore(createJob(), {
      cityName: "Sydney",
      stateName: "NSW",
      countryName: "Australia",
      workMode: "hybrid",
      employmentType: "full_time",
      workRights: "full_time_allowed",
      skills: ["JIRA", "Manual Testing", "SQL Basics"],
    });

    expect(score).toBeGreaterThan(70);
  });

  it("penalizes high work-rights risk for restricted profiles", () => {
    const lowRiskScore = calculateMatchScore(createJob({ workRightsRisk: "Low" }), {
      workRights: "student_visa",
    });
    const highRiskScore = calculateMatchScore(
      createJob({ workRightsRisk: "High" }),
      {
        workRights: "student_visa",
      }
    );

    expect(highRiskScore).toBeLessThan(lowRiskScore);
  });
});
