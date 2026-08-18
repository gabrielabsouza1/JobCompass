import { describe, expect, it } from "vitest";

import {
  parseSkillsFromProfile,
  uniqueSkills,
} from "@/lib/profile/skills";

describe("profile skills helpers", () => {
  it("deduplicates skills case-insensitively", () => {
    expect(uniqueSkills(["JIRA", "jira", " SQL ", "SQL"])).toEqual([
      "JIRA",
      "SQL",
    ]);
  });

  it("parses skills from arrays and JSON strings", () => {
    expect(parseSkillsFromProfile(["JIRA", "Manual Testing"])).toEqual([
      "JIRA",
      "Manual Testing",
    ]);
    expect(parseSkillsFromProfile('["JIRA","SQL Basics"]')).toEqual([
      "JIRA",
      "SQL Basics",
    ]);
  });
});
