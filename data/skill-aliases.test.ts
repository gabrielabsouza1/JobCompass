import { describe, expect, it } from "vitest";

import { expandSkillTerms } from "@/data/skill-aliases";

describe("expandSkillTerms", () => {
  it("returns aliases for known skills", () => {
    expect(expandSkillTerms("JIRA")).toEqual(
      expect.arrayContaining(["jira"])
    );
  });

  it("includes the original skill term", () => {
    expect(expandSkillTerms("Custom Skill")).toContain("custom skill");
  });
});
