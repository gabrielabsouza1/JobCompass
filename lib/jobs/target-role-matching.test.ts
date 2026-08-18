import { describe, expect, it } from "vitest";

import { createTestJob } from "@/lib/test/create-test-job";
import {
  compareJobsByTargetRoles,
  getBestTargetRoleMatch,
  getRoleKeywords,
} from "@/lib/jobs/target-role-matching";

describe("target-role-matching", () => {
  it("extracts role keywords", () => {
    expect(getRoleKeywords("Junior Software Tester")).toEqual([
      "junior",
      "software",
      "tester",
    ]);
  });

  it("finds the best target role match for a job", () => {
    const job = createTestJob({
      title: "Junior Software Tester",
      description: "Manual testing and bug reporting.",
    });

    expect(
      getBestTargetRoleMatch(job, ["QA Tester", "Junior Software Tester"])
    ).toEqual({
      role: "Junior Software Tester",
      matchedKeywordCount: 3,
      totalKeywords: 3,
    });
  });

  it("ranks jobs with stronger role matches first", () => {
    const qaJob = createTestJob({
      id: "qa",
      title: "QA Tester",
      description: "Quality assurance role.",
    });
    const adminJob = createTestJob({
      id: "admin",
      title: "Office Administrator",
      description: "Admin support role.",
    });

    expect(
      compareJobsByTargetRoles(qaJob, adminJob, ["QA Tester"])
    ).toBeLessThan(0);
  });
});
