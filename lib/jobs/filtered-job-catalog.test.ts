import { describe, expect, it } from "vitest";

import { createTestJob } from "@/lib/test/create-test-job";
import { buildFilteredJobPage } from "@/lib/jobs/filtered-job-catalog";

describe("buildFilteredJobPage", () => {
  it("merges prefetched jobs with paginated provider results", async () => {
    const prefetched = [
      createTestJob({
        id: "remotive-1",
        source: "Remotive",
        title: "Remote QA Tester",
        workMode: "Remote",
      }),
    ];

    const page = await buildFilteredJobPage(
      async (providerPage) => {
        if (providerPage > 1) {
          return { jobs: [], total: 1 };
        }

        return {
          jobs: [
            createTestJob({
              id: "adzuna-1",
              source: "Adzuna",
              title: "QA Tester",
            }),
          ],
          total: 1,
        };
      },
      prefetched,
      {
        selectedSourceIds: ["adzuna", "remotive"],
      },
      {
        countryName: "Australia",
        stateName: "NSW",
        cityName: "Sydney",
        workMode: "hybrid",
        employmentType: "full_time",
        workRights: "full_time_allowed",
        skills: ["JIRA"],
      },
      ["QA Tester"],
      1,
      10
    );

    expect(page.jobs).toHaveLength(2);
    expect(page.jobs.map((job) => job.id)).toEqual(
      expect.arrayContaining(["adzuna-1", "remotive-1"])
    );
    expect(page.jobs.every((job) => job.matchScore > 0)).toBe(true);
  });

  it("supports prefetched-only catalogs", async () => {
    const page = await buildFilteredJobPage(
      null,
      [
        createTestJob({
          id: "jooble-1",
          source: "Jooble",
        }),
      ],
      {
        selectedSourceIds: ["jooble"],
      },
      {
        countryName: "",
        stateName: "",
        cityName: "",
        workMode: "",
        employmentType: "",
        workRights: "",
        skills: [],
      },
      [],
      1,
      10
    );

    expect(page.jobs).toHaveLength(1);
    expect(page.total).toBe(1);
  });
});
