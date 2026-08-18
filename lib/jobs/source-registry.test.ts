import { describe, expect, it } from "vitest";

import {
  getSelectedInAppSourceIds,
  isInAppSourceEnabled,
  jobMatchesSelectedInAppSources,
} from "@/lib/jobs/source-registry";

describe("source registry helpers", () => {
  it("returns only enabled in-app source ids", () => {
    expect(
      getSelectedInAppSourceIds(["adzuna", "seek", "remotive", "jooble"])
    ).toEqual(["adzuna", "remotive", "jooble"]);
  });

  it("checks whether a specific in-app source is enabled", () => {
    expect(isInAppSourceEnabled(["adzuna", "seek"], "adzuna")).toBe(true);
    expect(isInAppSourceEnabled(["adzuna", "seek"], "remotive")).toBe(false);
  });

  it("matches jobs to selected in-app sources by source name", () => {
    expect(
      jobMatchesSelectedInAppSources("Jooble", ["jooble", "seek"])
    ).toBe(true);
    expect(
      jobMatchesSelectedInAppSources("Adzuna", ["remotive", "seek"])
    ).toBe(false);
  });
});
