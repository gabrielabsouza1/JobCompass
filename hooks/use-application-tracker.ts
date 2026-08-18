"use client";

import { useEffect, useMemo, useState } from "react";

import type { MockApplication } from "@/data/mock-applications";
import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import {
  getResolvableSavedJobs,
  resolveJobById,
  resolveJobFromSavedRecords,
} from "@/lib/jobs/resolve-job";
import type { ApplicationStatus, Job } from "@/types";

import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  MessageCircle,
  XCircle,
} from "lucide-react";

type ApplicationItem = {
  job: Job;
  application: MockApplication;
};

export function useApplicationTracker() {
  const { savedJobs } = useSavedJobs();
  const { applications, addApplication, updateApplication } = useApplications();
  const [resolvedJobs, setResolvedJobs] = useState<Record<string, Job>>({});

  const trackerJobs = useMemo(
    () => getResolvableSavedJobs(savedJobs),
    [savedJobs]
  );

  const [newApplication, setNewApplication] = useState({
    jobId: trackerJobs[0]?.id ?? "",
    status: "Applied" as ApplicationStatus,
    nextStep: "",
    notes: "",
  });

  useEffect(() => {
    if (trackerJobs.length === 0) {
      return;
    }

    setNewApplication((current) => {
      if (current.jobId && trackerJobs.some((job) => job.id === current.jobId)) {
        return current;
      }

      return {
        ...current,
        jobId: trackerJobs[0]?.id ?? "",
      };
    });
  }, [trackerJobs]);

  useEffect(() => {
    let isMounted = true;

    async function resolveMissingJobs() {
      const nextResolved: Record<string, Job> = {};

      for (const application of applications) {
        const localJob = resolveJobFromSavedRecords(application.jobId, savedJobs);

        if (localJob) {
          nextResolved[application.jobId] = localJob;
          continue;
        }

        const resolvedJob = await resolveJobById(application.jobId, savedJobs);

        if (resolvedJob) {
          nextResolved[application.jobId] = resolvedJob;
        }
      }

      if (!isMounted) {
        return;
      }

      setResolvedJobs(nextResolved);
    }

    void resolveMissingJobs();

    return () => {
      isMounted = false;
    };
  }, [applications, savedJobs]);

  function resolveJob(jobId: string) {
    return (
      resolveJobFromSavedRecords(jobId, savedJobs) ??
      resolvedJobs[jobId] ??
      null
    );
  }

  const applicationByJobId = new Map(
    applications.map((application) => [application.jobId, application])
  );

  const savedApplicationItems: ApplicationItem[] = savedJobs
    .map((record) => {
      const job = record.snapshot;

      if (!job) {
        return null;
      }

      const application = applicationByJobId.get(job.id);

      if (application && application.status !== "Saved") {
        return null;
      }

      return {
        job,
        application: application ?? {
          id: `saved-${job.id}`,
          jobId: job.id,
          status: "Saved" as const,
          nextStep: "Review job and prepare application.",
        },
      };
    })
    .filter((item): item is ApplicationItem => item !== null);

  function getApplicationItemsByStatus(
    status: ApplicationStatus
  ): ApplicationItem[] {
    return applications
      .filter((application) => application.status === status)
      .map((application) => {
        const job = resolveJob(application.jobId);

        if (!job) {
          return null;
        }

        return {
          job,
          application,
        };
      })
      .filter((item): item is ApplicationItem => item !== null);
  }

  const applicationColumns = [
    {
      id: "saved",
      title: "Saved",
      icon: Clock3,
      color: "bg-slate-100 text-slate-700",
      items: savedApplicationItems,
    },
    {
      id: "applied",
      title: "Applied",
      icon: FileCheck2,
      color: "bg-sky-50 text-sky-700",
      items: getApplicationItemsByStatus("Applied"),
    },
    {
      id: "interview",
      title: "Interview",
      icon: MessageCircle,
      color: "bg-purple-50 text-purple-700",
      items: getApplicationItemsByStatus("Interview"),
    },
    {
      id: "offer",
      title: "Offer",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
      items: getApplicationItemsByStatus("Offer"),
    },
    {
      id: "rejected",
      title: "Rejected",
      icon: XCircle,
      color: "bg-red-50 text-red-700",
      items: getApplicationItemsByStatus("Rejected"),
    },
  ];

  const totalApplications = applicationColumns.reduce(
    (total, column) => total + column.items.length,
    0
  );

  async function handleAddApplication() {
    const created = await addApplication({
      id: `app-${Date.now()}`,
      jobId: newApplication.jobId,
      status: newApplication.status,
      appliedAt:
        newApplication.status === "Applied" ||
        newApplication.status === "Interview" ||
        newApplication.status === "Offer"
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      nextStep:
        newApplication.nextStep.trim() || "Review this application later.",
      notes: newApplication.notes.trim() || undefined,
    });

    if (!created) {
      return false;
    }

    setNewApplication({
      jobId: trackerJobs[0]?.id ?? "",
      status: "Applied",
      nextStep: "",
      notes: "",
    });

    return true;
  }

  async function trackJob(
    job: Job,
    status: ApplicationStatus = "Saved",
    nextStep = "Review job and prepare application."
  ) {
    const existing = applications.find((application) => application.jobId === job.id);

    if (existing) {
      return updateApplication(existing.id, {
        status,
        nextStep,
        appliedAt:
          status === "Applied" || status === "Interview" || status === "Offer"
            ? new Date().toISOString().slice(0, 10)
            : undefined,
      });
    }

    return addApplication({
      id: `app-${Date.now()}`,
      jobId: job.id,
      status,
      nextStep,
      appliedAt:
        status === "Applied" || status === "Interview" || status === "Offer"
          ? new Date().toISOString().slice(0, 10)
          : undefined,
    });
  }

  return {
    jobs: trackerJobs,
    newApplication,
    setNewApplication,
    applicationColumns,
    totalApplications,
    handleAddApplication,
    trackJob,
    updateApplication,
  };
}
