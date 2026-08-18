import type { Job } from "@/types";

export function createTestJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    title: "QA Tester",
    company: "Acme",
    source: "Adzuna",
    sourceType: "api",
    location: "Sydney, NSW, Australia",
    country: "Australia",
    state: "NSW",
    city: "Sydney",
    workMode: "Hybrid",
    employmentType: "Full-time",
    postedAt: "2026-08-01",
    matchScore: 0,
    skills: ["JIRA", "Manual Testing"],
    matchedProfileSkills: [],
    missingProfileSkills: [],
    description: "Manual testing role with JIRA and SQL Basics.",
    url: "https://example.com/job",
    currency: "AUD",
    workRightsRisk: "Low",
    ...overrides,
  };
}
