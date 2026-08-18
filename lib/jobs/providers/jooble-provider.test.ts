import { describe, expect, it } from "vitest";

import {
  buildJoobleKeywords,
  buildJoobleLocationFromFilters,
} from "@/lib/jobs/providers/jooble-provider";

describe("jooble-provider helpers", () => {
  it("builds Jooble keywords with a broad fallback", () => {
    expect(buildJoobleKeywords("QA Tester")).toBe("QA Tester");
    expect(buildJoobleKeywords("   ")).toBe("jobs");
  });

  it("prefers city, then state, then country for Jooble location", () => {
    expect(
      buildJoobleLocationFromFilters({
        country: "Australia",
        state: "NSW",
        city: "Sydney",
      })
    ).toBe("Sydney");
    expect(
      buildJoobleLocationFromFilters({
        country: "Australia",
        state: "NSW",
        city: "any",
      })
    ).toBe("NSW");
    expect(
      buildJoobleLocationFromFilters({
        fallbackCountryName: "Australia",
      })
    ).toBe("Australia");
  });
});
