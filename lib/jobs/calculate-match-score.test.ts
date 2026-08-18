import { describe, expect, it } from "vitest";

import { createTestJob } from "@/lib/test/create-test-job";
import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";

describe("calculateMatchScore", () => {
  it("rewards matching location, work mode, employment type, and skills", () => {
    const score = calculateMatchScore(createTestJob(), {
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
    const lowRiskScore = calculateMatchScore(createTestJob({ workRightsRisk: "Low" }), {
      workRights: "student_visa",
    });
    const highRiskScore = calculateMatchScore(
      createTestJob({ workRightsRisk: "High" }),
      {
        workRights: "student_visa",
      }
    );

    expect(highRiskScore).toBeLessThan(lowRiskScore);
  });
});
