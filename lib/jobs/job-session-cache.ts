import type { Job } from "@/types";

const JOB_CACHE_KEY = "jobcompass.job-cache";

type JobCache = Record<string, Job>;

function readCache(): JobCache {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(JOB_CACHE_KEY);

    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as JobCache;
  } catch {
    return {};
  }
}

function writeCache(cache: JobCache) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(JOB_CACHE_KEY, JSON.stringify(cache));
}

export function cacheJobs(jobs: Job[]) {
  const cache = readCache();

  for (const job of jobs) {
    cache[job.id] = job;
  }

  writeCache(cache);
}

export function getCachedJob(jobId: string) {
  return readCache()[jobId] ?? null;
}
