import type { Job } from "@/types";

import { detectWorkRightsRisk } from "@/lib/jobs/detect-work-rights-risk";
import { extractJobSkills } from "@/lib/jobs/extract-job-skills";
import { normalizeJob } from "@/lib/jobs/job-normalizer";

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  category?: string;
  tags?: string[];
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
};

type RemotiveApiResponse = {
  jobs: RemotiveJob[];
  "job-count"?: number;
  "total-job-count"?: number;
};

export type GetRemotiveJobsParams = {
  search?: string;
  category?: string;
  limit?: number;
};

export type RemotiveJobsResult = {
  jobs: Job[];
  total: number;
};

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
let cachedJobs: Job[] | null = null;
let cachedAt = 0;
let cachedSearchKey = "";

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

  if (value.includes("contract") || value.includes("freelance")) {
    return "Contract";
  }

  return value
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeRemotiveJob(job: RemotiveJob): Job {
  const title = job.title;
  const description = job.description ?? "";
  const skills = uniqueStrings([
    ...extractJobSkills(title, description),
    ...(job.tags ?? []),
  ]);

  return normalizeJob({
    id: `remotive-${job.id}`,
    title,
    company: job.company_name,
    source: "Remotive",
    sourceType: "api",
    location: job.candidate_required_location ?? "Remote",
    country: "",
    state: "",
    city: "",
    workMode: "Remote",
    employmentType: getEmploymentType(job.job_type),
    postedAt: job.publication_date ?? "Recently",
    skills,
    description,
    url: job.url,
    workRightsRisk: detectWorkRightsRisk(title, description),
    companyLogoUrl: job.company_logo_url,
  });
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLowerCase();

    if (!value.trim() || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function matchesSearch(job: Job, search?: string) {
  const query = search?.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const haystack = `${job.title} ${job.company} ${job.description} ${job.skills.join(" ")}`.toLowerCase();

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

async function fetchRemotiveJobsFromApi(search?: string) {
  const url = new URL("https://remotive.com/api/remote-jobs");

  if (search?.trim()) {
    url.searchParams.set("search", search.trim());
  }

  const response = await fetch(url.toString(), {
    next: {
      revalidate: CACHE_TTL_MS / 1000,
    },
  });

  if (!response.ok) {
    console.error("Remotive API error", response.status);
    return [];
  }

  const data = (await response.json()) as RemotiveApiResponse;

  return (data.jobs ?? []).map(normalizeRemotiveJob);
}

export async function getRemotiveJobs({
  search,
  limit = 100,
}: GetRemotiveJobsParams = {}): Promise<RemotiveJobsResult> {
  const searchKey = search?.trim().toLowerCase() ?? "";
  const now = Date.now();
  const cacheIsFresh =
    cachedJobs &&
    now - cachedAt < CACHE_TTL_MS &&
    cachedSearchKey === searchKey;

  const allJobs = cacheIsFresh
    ? (cachedJobs ?? [])
    : await fetchRemotiveJobsFromApi(search);

  if (!cacheIsFresh) {
    cachedJobs = allJobs;
    cachedAt = now;
    cachedSearchKey = searchKey;
  }

  const filteredJobs = allJobs.filter((job) => matchesSearch(job, search));

  return {
    jobs: filteredJobs.slice(0, limit),
    total: filteredJobs.length,
  };
}

export async function getRemotiveJobById(jobId: string) {
  const remotiveId = jobId.startsWith("remotive-")
    ? jobId.replace("remotive-", "")
    : jobId;

  const { jobs } = await getRemotiveJobs({ limit: 500 });

  return jobs.find((job) => job.id === `remotive-${remotiveId}`) ?? null;
}

export function clearRemotiveCacheForTests() {
  cachedJobs = null;
  cachedAt = 0;
  cachedSearchKey = "";
}
