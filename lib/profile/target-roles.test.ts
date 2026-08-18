import { describe, expect, it } from "vitest";

import {
  DEFAULT_TARGET_ROLES,
  parseTargetRolesFromProfile,
  targetRolesFromProfileValue,
  uniqueTargetRoles,
} from "@/lib/profile/target-roles";

describe("target-roles helpers", () => {
  it("deduplicates target roles case-insensitively", () => {
    expect(
      uniqueTargetRoles(["QA Tester", "qa tester", " Manual Tester "])
    ).toEqual(["QA Tester", "Manual Tester"]);
  });

  it("parses target roles from arrays and JSON strings", () => {
    expect(parseTargetRolesFromProfile(["QA Tester"])).toEqual(["QA Tester"]);
    expect(parseTargetRolesFromProfile('["Manual Tester"]')).toEqual([
      "Manual Tester",
    ]);
  });

  it("falls back to default roles when profile is empty", () => {
    expect(targetRolesFromProfileValue([])).toEqual(DEFAULT_TARGET_ROLES);
    expect(targetRolesFromProfileValue(["Data Analyst"])).toEqual([
      "Data Analyst",
    ]);
  });
});
