import { mockJobs } from "@/data/mock-data";
import type { Job } from "@/types";
import { normalizeJob } from "@/lib/jobs/job-normalizer";

export async function getMockJobs(): Promise<Job[]> {
  return mockJobs.map((job) =>
    normalizeJob({
      id: job.id,
      title: job.title,
      company: job.company,
      source: job.source,
      sourceType: job.sourceType,
      location: job.location,
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
      description: job.description,
      url: job.url,
      workRightsRisk: job.workRightsRisk,
    })
  );
}