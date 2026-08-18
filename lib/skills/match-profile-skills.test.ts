import { describe, expect, it } from "vitest";

import { getProfileSkillMatch } from "@/lib/skills/match-profile-skills";

describe("getProfileSkillMatch", () => {
  it("returns zero score when the profile has no skills", () => {
    expect(
      getProfileSkillMatch([], {
        title: "QA Tester",
        description: "JIRA and SQL Basics required.",
        skills: ["JIRA"],
      })
    ).toEqual({
      matchedSkills: [],
      missingSkills: [],
      skillsScore: 0,
    });
  });

  it("matches profile skills against job text and aliases", () => {
    const result = getProfileSkillMatch(
      ["JIRA", "SQL Basics", "Manual Testing"],
      {
        title: "Manual Tester",
        description: "Experience with JIRA and SQL required.",
        skills: ["JIRA"],
      }
    );

    expect(result.matchedSkills).toEqual(
      expect.arrayContaining(["JIRA", "SQL Basics"])
    );
    expect(result.missingSkills).not.toContain("JIRA");
    expect(result.missingSkills).not.toContain("SQL Basics");
    expect(result.skillsScore).toBe(12);
  });
});
