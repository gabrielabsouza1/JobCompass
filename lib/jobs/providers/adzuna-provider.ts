import type { Job } from "@/types";
import { normalizeJob } from "@/lib/jobs/job-normalizer";

type AdzunaJob = {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  company?: {
    display_name?: string;
  };
  location?: {
    display_name?: string;
    area?: string[];
  };
  contract_time?: string;
  category?: {
    label?: string;
  };
};

type AdzunaSearchResponse = {
  results: AdzunaJob[];
  count: number;
};

type GetAdzunaJobsParams = {
  countryCode?: string;
  what?: string;
  where?: string;
  resultsPerPage?: number;
  page?: number;
};

function getAdzunaCountryCode(countryCode?: string) {
  const value = countryCode?.toLowerCase();

  if (!value) return "au";

  return value;
}

function getEmploymentType(contractTime?: string) {
  if (contractTime === "full_time") return "Full-time";
  if (contractTime === "part_time") return "Part-time";

  return "Not listed";
}

function getCityFromArea(area?: string[]) {
  if (!area || area.length === 0) {
    return "";
  }

  return area[area.length - 1] ?? "";
}

function getStateFromArea(area?: string[]) {
  if (!area || area.length < 2) {
    return "";
  }

  return area[area.length - 2] ?? "";
}

export async function getAdzunaJobs({
  countryCode = "AU",
  what = "software tester",
  where = "Melbourne",
  resultsPerPage = 10,
  page = 1,
}: GetAdzunaJobsParams): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Missing Adzuna credentials");
    return [];
  }

  const adzunaCountryCode = getAdzunaCountryCode(countryCode);

  const url = new URL(
    `https://api.adzuna.com/v1/api/jobs/${adzunaCountryCode}/search/${page}`
  );

  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  url.searchParams.set("content-type", "application/json");

  if (what) {
    url.searchParams.set("what", what);
  }

  if (where) {
    url.searchParams.set("where", where);
  }

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    console.error("Adzuna API error", response.status);
    return [];
  }

  const data = (await response.json()) as AdzunaSearchResponse;

  return data.results.map((job) =>
    normalizeJob({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company?.display_name ?? "Company not listed",
      source: "Adzuna",
      sourceType: "api",
      location: job.location?.display_name ?? "Location not listed",
      state: getStateFromArea(job.location?.area),
      city: getCityFromArea(job.location?.area),
      workMode: job.description.toLowerCase().includes("remote")
        ? "Remote"
        : "Onsite",
      employmentType: getEmploymentType(job.contract_time),
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: "AUD",
      postedAt: new Date(job.created).toLocaleDateString("en-AU"),
      matchScore: 0,
      skills: [],
      description: job.description,
      url: job.redirect_url,
      workRightsRisk: "Low",
    })
  );
}