import { describe, expect, it } from "vitest";

import { isSupportedResumeMimeType } from "@/lib/resume/extract-resume-text";

describe("isSupportedResumeMimeType", () => {
  it("accepts PDF, DOCX, and plain text resumes", () => {
    expect(isSupportedResumeMimeType("application/pdf")).toBe(true);
    expect(
      isSupportedResumeMimeType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ).toBe(true);
    expect(isSupportedResumeMimeType("text/plain")).toBe(true);
  });

  it("rejects unsupported mime types", () => {
    expect(isSupportedResumeMimeType("image/png")).toBe(false);
    expect(isSupportedResumeMimeType("application/msword")).toBe(false);
  });
});
