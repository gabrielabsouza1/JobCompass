import { describe, expect, it } from "vitest";

import { buildAdzunaWhatFromQuery } from "@/lib/jobs/build-adzuna-search-query";

describe("buildAdzunaWhatFromQuery", () => {
  it("returns an empty object for blank queries", () => {
    expect(buildAdzunaWhatFromQuery("   ")).toEqual({});
  });

  it("passes trimmed search text to Adzuna", () => {
    expect(buildAdzunaWhatFromQuery("  QA Tester  ")).toEqual({
      what: "QA Tester",
    });
  });
});
