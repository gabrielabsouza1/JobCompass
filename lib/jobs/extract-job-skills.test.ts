import { describe, expect, it } from "vitest";

import { extractJobSkills } from "@/lib/jobs/extract-job-skills";

describe("extractJobSkills", () => {
  it("detects catalog skills in job text", () => {
    expect(
      extractJobSkills(
        "Manual Tester",
        "Experience with JIRA, SQL Basics, and Agile ceremonies."
      )
    ).toEqual(
      expect.arrayContaining(["JIRA", "SQL Basics", "Agile"])
    );
  });

  it("respects the result limit", () => {
    expect(
      extractJobSkills(
        "Engineer",
        "JIRA SQL JavaScript TypeScript Python React Node.js Git Docker AWS Azure Linux",
        3
      ).length
    ).toBe(3);
  });
});
