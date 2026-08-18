import type { Job } from "@/types";

export type SavedJobRecord = {
  jobId: string;
  snapshot: Job | null;
  savedAt?: string;
};

function isJobSnapshot(value: unknown): value is Job {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.company === "string"
  );
}

export function parseJobSnapshot(value: unknown): Job | null {
  if (!value) {
    return null;
  }

  if (isJobSnapshot(value)) {
    return value;
  }

  return null;
}

export function serializeJobSnapshot(job: Job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    source: job.source,
    sourceType: job.sourceType,
    location: job.location,
    country: job.country,
    state: job.state,
    city: job.city,
    workMode: job.workMode,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    postedAt: job.postedAt,
    matchScore: job.matchScore,
    skills: job.skills,
    matchedProfileSkills: job.matchedProfileSkills ?? [],
    missingProfileSkills: job.missingProfileSkills ?? [],
    description: job.description,
    url: job.url,
    workRightsRisk: job.workRightsRisk,
    companyLogoUrl: job.companyLogoUrl,
  } satisfies Job;
}
