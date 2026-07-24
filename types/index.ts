export type WorkMode = "Remote" | "Hybrid" | "Onsite";

export type JobSourceType = "api" | "smart_link";

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Offer"
  | "Archived";

export type Job = {
  id: string;
  title: string;
  company: string;
  source: string;
  sourceType: JobSourceType;
  location: string;
  state: string;
  city: string;
  workMode: WorkMode;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: "AUD";
  postedAt: string;
  matchScore: number;
  skills: string[];
  description: string;
  url: string;
  workRightsRisk: "Low" | "Medium" | "High";
};