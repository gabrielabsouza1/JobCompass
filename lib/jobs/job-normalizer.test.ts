import { describe, expect, it } from "vitest";

import { normalizeJob } from "@/lib/jobs/job-normalizer";

describe("normalizeJob", () => {
  it("normalizes work mode and default fields", () => {
    expect(
      normalizeJob({
        id: "job-1",
        title: "Remote QA Tester",
        company: "Acme",
        source: "Adzuna",
        sourceType: "api",
        location: "Sydney",
        workMode: "remote",
        description: "Testing role",
        url: "https://example.com",
      })
    ).toEqual(
      expect.objectContaining({
        workMode: "Remote",
        employmentType: "Not listed",
        currency: "AUD",
        workRightsRisk: "Low",
        skills: [],
      })
    );
  });
});
