import type { Job, WorkMode } from "@/types";

type RawJobInput = {
  id: string;
  title: string;
  company: string;
  source: string;
  sourceType: "api" | "smart_link";
  location: string;
  country?: string;
  state?: string;
  city?: string;
  workMode?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: "AUD";
  postedAt?: string;
  matchScore?: number;
  skills?: string[];
  matchedProfileSkills?: string[];
  missingProfileSkills?: string[];
  description: string;
  url: string;
  workRightsRisk?: "Low" | "Medium" | "High";
  companyLogoUrl?: string;
};

function normalizeWorkMode(workMode?: string): WorkMode {
  const value = workMode?.toLowerCase().trim();

  if (value === "remote") return "Remote";
  if (value === "hybrid") return "Hybrid";

  return "Onsite";
}

export function normalizeJob(rawJob: RawJobInput): Job {
  return {
    id: rawJob.id,
    title: rawJob.title,
    company: rawJob.company,
    source: rawJob.source,
    sourceType: rawJob.sourceType,
    location: rawJob.location,
    country: rawJob.country ?? "",
    state: rawJob.state ?? "",
    city: rawJob.city ?? "",
    workMode: normalizeWorkMode(rawJob.workMode),
    employmentType: rawJob.employmentType ?? "Not listed",
    salaryMin: rawJob.salaryMin,
    salaryMax: rawJob.salaryMax,
    currency: rawJob.currency ?? "AUD",
    postedAt: rawJob.postedAt ?? "Recently",
    matchScore: rawJob.matchScore ?? 0,
    skills: rawJob.skills ?? [],
    matchedProfileSkills: rawJob.matchedProfileSkills ?? [],
    missingProfileSkills: rawJob.missingProfileSkills ?? [],
    description: rawJob.description,
    url: rawJob.url,
    workRightsRisk: rawJob.workRightsRisk ?? "Low",
    companyLogoUrl: rawJob.companyLogoUrl,
  };
}