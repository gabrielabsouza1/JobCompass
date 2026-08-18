import { describe, expect, it } from "vitest";

import {
  formatPostedAt,
  formatSalary,
  getPostedAtValue,
  getRiskColor,
  getWorkModeColor,
} from "@/lib/job-utils";

describe("job-utils", () => {
  it("formats salary ranges", () => {
    expect(formatSalary()).toBe("Salary not listed");
    expect(formatSalary(80000, 95000)).toBe("$80,000 - $95,000 AUD");
    expect(formatSalary(70000)).toBe("From $70,000 AUD");
  });

  it("parses posted-at values for sorting", () => {
    expect(getPostedAtValue("Recently")).toBeGreaterThan(0);
    expect(getPostedAtValue("2 days ago")).toBeLessThan(Date.now());
    expect(getPostedAtValue("18/08/2026")).toBe(
      new Date(2026, 7, 18).getTime()
    );
  });

  it("formats posted-at labels for display", () => {
    expect(formatPostedAt("Recently")).toBe("Recently");
    expect(formatPostedAt("3 days ago")).toBe("3 days ago");
    expect(formatPostedAt("18/08/2026")).toBe(
      new Date(2026, 7, 18).toLocaleDateString("en-AU")
    );
  });

  it("returns badge color classes", () => {
    expect(getWorkModeColor("Remote")).toContain("purple");
    expect(getRiskColor("High")).toContain("red");
  });
});
