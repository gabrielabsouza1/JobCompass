import { describe, expect, it } from "vitest";

import {
  getAdzunaCodeFromCountryName,
  getAdzunaCountryByName,
  getAdzunaCountryNameFromCode,
} from "@/lib/jobs/adzuna-countries";

describe("adzuna-countries", () => {
  it("resolves countries by name and aliases", () => {
    expect(getAdzunaCountryByName("Australia")?.code).toBe("au");
    expect(getAdzunaCountryByName("uk")?.name).toBe("United Kingdom");
  });

  it("maps country names and codes in both directions", () => {
    expect(getAdzunaCodeFromCountryName("New Zealand")).toBe("nz");
    expect(getAdzunaCountryNameFromCode("au")).toBe("Australia");
  });
});
