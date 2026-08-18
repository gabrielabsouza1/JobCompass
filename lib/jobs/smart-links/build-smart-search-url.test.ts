import { describe, expect, it } from "vitest";

import {
  buildIndeedSearchUrl,
  buildLinkedInSearchUrl,
  buildSeekSearchUrl,
  buildSmartSearchParamsFromProfile,
  buildSmartSearchUrl,
  buildWorkforceAustraliaSearchUrl,
} from "@/lib/jobs/smart-links/build-smart-search-url";

describe("build-smart-search-url", () => {
  const params = {
    query: "QA Tester",
    location: "Sydney, NSW, Australia",
    workMode: "remote",
  };

  it("builds provider-specific search URLs", () => {
    expect(buildSeekSearchUrl(params)).toContain("seek.com.au/jobs");
    expect(buildSeekSearchUrl(params)).toContain("keywords=QA+Tester+remote");
    expect(buildSeekSearchUrl(params)).toContain(
      "where=Sydney%2C+NSW%2C+Australia"
    );

    expect(buildLinkedInSearchUrl(params)).toContain("linkedin.com/jobs/search");
    expect(buildIndeedSearchUrl(params)).toContain("au.indeed.com/jobs");
    expect(buildWorkforceAustraliaSearchUrl(params)).toContain(
      "workforceaustralia.gov.au"
    );
  });

  it("routes smart link builders by source id", () => {
    expect(buildSmartSearchUrl("seek", params)).toContain("seek.com.au");
    expect(buildSmartSearchUrl("linkedin", params)).toContain("linkedin.com");
    expect(buildSmartSearchUrl("unknown", params)).toBeNull();
  });

  it("builds search params from profile defaults", () => {
    expect(
      buildSmartSearchParamsFromProfile({
        targetRoles: ["QA Tester", "Manual Tester"],
        cityName: "Sydney",
        stateName: "NSW",
        countryName: "Australia",
        workMode: "hybrid",
      })
    ).toEqual({
      query: "QA Tester",
      location: "Sydney, NSW, Australia",
      workMode: "hybrid",
    });
  });
});
