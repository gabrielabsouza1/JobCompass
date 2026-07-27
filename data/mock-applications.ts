import type { ApplicationStatus } from "@/types";

export type MockApplication = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt?: string;
  nextStep: string;
  notes?: string;
};

export const mockApplications: MockApplication[] = [
  {
    id: "app-1",
    jobId: "3",
    status: "Applied",
    appliedAt: "2026-07-25",
    nextStep: "Wait for employer response.",
    notes: "Applied through Jooble.",
  },
  {
    id: "app-2",
    jobId: "1",
    status: "Interview",
    appliedAt: "2026-07-24",
    nextStep: "Prepare interview notes.",
    notes: "Focus on manual testing and JIRA experience.",
  },
];