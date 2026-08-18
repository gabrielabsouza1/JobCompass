import type { Job } from "@/types";

import { detectWorkRightsRisk } from "@/lib/jobs/detect-work-rights-risk";
import { extractJobSkills } from "@/lib/jobs/extract-job-skills";
import { getJoobleApiHost } from "@/lib/jobs/jooble-domains";
import { normalizeJob } from "@/lib/jobs/job-normalizer";

type JoobleJob = {
  id: number;
  title: string;
  location: string;
  snippet: string;
  salary?: string;
  source?: string;
  type?: string;
  link: string;
  company?: string;
  updated?: string;
};

type JoobleApiResponse = {
  totalCount: number;
  jobs: JoobleJob[];
};

export type GetJoobleJobsParams = {
  keywords?: string;
  location?: string;
  countryCode?: string;
  page?: number;
  perPage?: number;
  maxPages?: number;
};

export type JoobleJobsResult = {
  jobs: Job[];
  total: number;
};

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const DEFAULT_PER_PAGE = 50;
const DEFAULT_MAX_PAGES = 4;

type JoobleCacheEntry = {
  jobs: Job[];
  total: number;
  cachedAt: number;
};

const cache = new Map<string, JoobleCacheEntry>();

function getJoobleApiKey() {
  return process.env.JOOBLE_API_KEY?.trim() ?? "";
}

function buildCacheKey(
  countryCode: string,
  keywords: string,
  location: string,
  maxPages: number
) {
  return [
    countryCode.toLowerCase(),
    keywords.toLowerCase(),
    location.toLowerCase(),
    String(maxPages),
  ].join("|");
}

function getEmploymentType(jobType?: string) {
  const value = jobType?.toLowerCase().trim();

  if (!value) {
    return "Not listed";
  }

  if (value.includes("full")) {
    return "Full-time";
  }

  if (value.includes("part")) {
    return "Part-time";
  }

  if (value.includes("contract") || value.includes("temp")) {
    return "Contract";
  }

  if (value.includes("casual")) {
    return "Casual";
  }

  if (value.includes("intern")) {
    return "Internship";
  }

  return jobType ?? "Not listed";
}

function inferWorkMode(title: string, location: string, snippet: string) {
  const haystack = `${title} ${location} ${snippet}`.toLowerCase();

  if (haystack.includes("remote") || haystack.includes("work from home")) {
    return "Remote";
  }

  if (haystack.includes("hybrid")) {
    return "Hybrid";
  }

  return "Onsite";
}

function formatPostedAt(updated?: string) {
  if (!updated) {
    return "Recently";
  }

  const parsed = Date.parse(updated);

  if (Number.isNaN(parsed)) {
    return "Recently";
  }

  return new Date(parsed).toISOString();
}

function normalizeJoobleJob(job: JoobleJob): Job {
  const title = job.title;
  const description = job.snippet ?? "";
  const location = job.location ?? "";
  const skills = extractJobSkills(title, description);

  return normalizeJob({
    id: `jooble-${job.id}`,
    title,
    company: job.company?.trim() || "Company not listed",
    source: "Jooble",
    sourceType: "api",
    location,
    country: "",
    state: "",
    city: "",
    workMode: inferWorkMode(title, location, description),
    employmentType: getEmploymentType(job.type),
    postedAt: formatPostedAt(job.updated),
    skills,
    description,
    url: job.link,
    workRightsRisk: detectWorkRightsRisk(title, description),
  });
}

export function buildJoobleLocationFromFilters({
  country,
  state,
  city,
  fallbackCountryName,
}: {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  fallbackCountryName?: string | null;
}) {
  if (city && city !== "any") {
    return city;
  }

  if (state && state !== "any") {
    return state;
  }

  if (country && country !== "any") {
    return country;
  }

  return fallbackCountryName?.trim() || "Australia";
}

export function buildJoobleKeywords(query?: string) {
  const trimmed = query?.trim();

  if (trimmed) {
    return trimmed;
  }

  return "jobs";
}

async function fetchJooblePage(
  countryCode: string,
  keywords: string,
  location: string,
  page: number,
  perPage: number
) {
  const apiKey = getJoobleApiKey();

  if (!apiKey) {
    console.warn("Missing Jooble API key");
    return null;
  }

  const host = getJoobleApiHost(countryCode);
  const response = await fetch(`https://${host}/api/${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keywords,
      location,
      page,
      ResultOnPage: perPage,
      companysearch: false,
    }),
    next: {
      revalidate: CACHE_TTL_MS / 1000,
    },
  });

  if (!response.ok) {
    console.error("Jooble API error", response.status);
    return null;
  }

  return (await response.json()) as JoobleApiResponse;
}

async function fetchJoobleJobsFromApi({
  keywords,
  location,
  countryCode = "AU",
  perPage = DEFAULT_PER_PAGE,
  maxPages = DEFAULT_MAX_PAGES,
}: Required<Pick<GetJoobleJobsParams, "keywords" | "location">> &
  Pick<GetJoobleJobsParams, "countryCode" | "perPage" | "maxPages">) {
  const jobs: Job[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await fetchJooblePage(
      countryCode,
      keywords,
      location,
      page,
      perPage
    );

    if (!data || data.jobs.length === 0) {
      break;
    }

    total = data.totalCount;
    jobs.push(...data.jobs.map(normalizeJoobleJob));

    if (jobs.length >= total) {
      break;
    }
  }

  return {
    jobs,
    total,
  };
}

export async function getJoobleJobs({
  keywords,
  location,
  countryCode = "AU",
  perPage = DEFAULT_PER_PAGE,
  maxPages = DEFAULT_MAX_PAGES,
}: GetJoobleJobsParams = {}): Promise<JoobleJobsResult> {
  const resolvedKeywords = buildJoobleKeywords(keywords);
  const resolvedLocation = location?.trim() || "Australia";
  const cacheKey = buildCacheKey(
    countryCode,
    resolvedKeywords,
    resolvedLocation,
    maxPages
  );
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return {
      jobs: cached.jobs,
      total: cached.total,
    };
  }

  const result = await fetchJoobleJobsFromApi({
    keywords: resolvedKeywords,
    location: resolvedLocation,
    countryCode,
    perPage,
    maxPages,
  });

  cache.set(cacheKey, {
    jobs: result.jobs,
    total: result.total,
    cachedAt: now,
  });

  return result;
}

export async function getJoobleJobById(
  jobId: string,
  {
    countryCode = "AU",
    location = "Australia",
  }: {
    countryCode?: string;
    location?: string;
  } = {}
) {
  const joobleId = jobId.startsWith("jooble-")
    ? jobId.replace("jooble-", "")
    : jobId;

  const { jobs } = await getJoobleJobs({
    countryCode,
    location,
    maxPages: DEFAULT_MAX_PAGES,
  });

  return jobs.find((job) => job.id === `jooble-${joobleId}`) ?? null;
}

export function clearJoobleCacheForTests() {
  cache.clear();
}
