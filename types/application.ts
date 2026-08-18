import type { ApplicationStatus } from "@/types";

export type Application = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt?: string;
  nextStep: string;
  notes?: string;
};
