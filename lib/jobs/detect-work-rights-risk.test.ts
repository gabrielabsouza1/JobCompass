import { describe, expect, it } from "vitest";

import { detectWorkRightsRisk } from "@/lib/jobs/detect-work-rights-risk";

describe("detectWorkRightsRisk", () => {
  it("flags high-risk citizenship requirements", () => {
    expect(
      detectWorkRightsRisk(
        "Security Analyst",
        "Must be an Australian citizen. No sponsorship available."
      )
    ).toBe("High");
  });

  it("flags medium-risk sponsorship wording", () => {
    expect(
      detectWorkRightsRisk(
        "Support Officer",
        "Eligible to work in Australia required. Visa sponsorship may be available."
      )
    ).toBe("Medium");
  });

  it("returns low risk when no restrictive phrases are found", () => {
    expect(
      detectWorkRightsRisk(
        "QA Tester",
        "Join our agile team and write test cases in JIRA."
      )
    ).toBe("Low");
  });
});
