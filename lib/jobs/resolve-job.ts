import type { Job } from "@/types";

import { getCachedJob } from "@/lib/jobs/job-session-cache";
import { parseJobSnapshot } from "@/lib/jobs/saved-job-snapshot";
import type { SavedJobRecord } from "@/lib/jobs/saved-job-snapshot";

export async function resolveJobById(
  jobId: string,
  savedJobs: SavedJobRecord[]
): Promise<Job | null> {
  const savedRecord = savedJobs.find((item) => item.jobId === jobId);

  if (savedRecord?.snapshot) {
    return savedRecord.snapshot;
  }

  const cachedJob = getCachedJob(jobId);

  if (cachedJob) {
    return cachedJob;
  }

  try {
    const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { job?: Job };

    return data.job ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function resolveJobFromSavedRecords(
  jobId: string,
  savedJobs: SavedJobRecord[]
) {
  const savedRecord = savedJobs.find((item) => item.jobId === jobId);

  if (savedRecord?.snapshot) {
    return savedRecord.snapshot;
  }

  return getCachedJob(jobId) ?? parseJobSnapshot(savedRecord?.snapshot);
}

export function getResolvableSavedJobs(savedJobs: SavedJobRecord[]) {
  return savedJobs
    .map((record) => record.snapshot)
    .filter((job): job is Job => job !== null);
}
