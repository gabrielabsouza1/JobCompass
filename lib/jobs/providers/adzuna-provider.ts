import type { Job } from "@/types";
import { normalizeJob } from "@/lib/jobs/job-normalizer";
import { normalizeAdzunaStaticUrl } from "@/lib/jobs/extract-adzuna-logo";

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
    logo_url?: string;
    logo?: string;
    image_url?: string;
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

export type GetAdzunaJobsParams = {
  countryCode?: string;
  what?: string;
  where?: string;
  resultsPerPage?: number;
  page?: number;
};

export type AdzunaJobsPageResult = {
  jobs: Job[];
  total: number;
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

function getCountryFromArea(area?: string[]) {
  if (!area || area.length === 0) {
    return "";
  }

  return area[0] ?? "";
}

function getStateFromArea(area?: string[]) {
  if (!area || area.length < 2) {
    return "";
  }

  if (area.length >= 3) {
    return area[1] ?? "";
  }

  return area[area.length - 2] ?? "";
}

function getCompanyLogoUrl(job: AdzunaJob): string | undefined {
  const companyRecord = job.company as Record<string, unknown> | undefined;
  const jobRecord = job as Record<string, unknown>;

  const candidates = [
    companyRecord?.logo_url,
    companyRecord?.logo,
    companyRecord?.image_url,
    jobRecord.logo_url,
    jobRecord.company_logo,
    jobRecord.image_url,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return normalizeAdzunaStaticUrl(value.trim());
    }
  }

  return undefined;
}

function normalizeAdzunaJob(job: AdzunaJob): Job {
  return normalizeJob({
    id: `adzuna-${job.id}`,
    title: job.title,
    company: job.company?.display_name ?? "Company not listed",
    source: "Adzuna",
    sourceType: "api",
    location: job.location?.display_name ?? "Location not listed",
    country: getCountryFromArea(job.location?.area),
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
    companyLogoUrl: getCompanyLogoUrl(job),
  });
}

async function fetchAdzunaPage(
  adzunaCountryCode: string,
  appId: string,
  appKey: string,
  {
    what,
    where,
    resultsPerPage,
    page,
  }: {
    what: string;
    where?: string;
    resultsPerPage: number;
    page: number;
  }
): Promise<AdzunaSearchResponse | null> {
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
    console.error("Adzuna API error", response.status, `(page ${page})`);
    return null;
  }

  return (await response.json()) as AdzunaSearchResponse;
}

export async function getAdzunaJobs({
  countryCode = "AU",
  what,
  where,
  resultsPerPage = 10,
  page = 1,
}: GetAdzunaJobsParams): Promise<AdzunaJobsPageResult> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Missing Adzuna credentials");
    return { jobs: [], total: 0 };
  }

  const adzunaCountryCode = getAdzunaCountryCode(countryCode);

  const data = await fetchAdzunaPage(adzunaCountryCode, appId, appKey, {
    what: what ?? "",
    where,
    resultsPerPage,
    page,
  });

  if (!data) {
    return { jobs: [], total: 0 };
  }

  return {
    jobs: data.results.map(normalizeAdzunaJob),
    total: data.count,
  };
}
