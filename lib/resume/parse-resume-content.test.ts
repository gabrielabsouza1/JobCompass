import { describe, expect, it } from "vitest";

import { parseResumeContent } from "@/lib/resume/parse-resume-content";

describe("parseResumeContent", () => {
  it("extracts skills and target roles from resume text", () => {
    const result = parseResumeContent(`
      Jane Doe
      QA Tester with experience in Manual Testing, JIRA, and SQL Basics.
      Seeking a Junior Software Tester or Manual Tester role.
    `);

    expect(result.skills).toEqual(
      expect.arrayContaining(["Manual Testing", "JIRA", "SQL Basics"])
    );
    expect(result.targetRoles).toEqual(
      expect.arrayContaining(["Manual Tester", "Junior Software Tester"])
    );
    expect(result.textLength).toBeGreaterThan(40);
    expect(result.excerpt.length).toBeGreaterThan(0);
  });
});
