"use client";

import { useEffect, useState } from "react";

import type { Job } from "@/types";

type JobsResponse = {
  jobs: Job[];
  total: number;
  fallbackMessage?: string;
};

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");

  async function loadJobs(options?: { showLoading?: boolean }) {
    const showLoading = options?.showLoading ?? true;

    if (showLoading) {
      setIsLoadingJobs(true);
      setJobsError("");
    }

    try {
      const response = await fetch("/api/jobs/search");

      if (!response.ok) {
        throw new Error("Could not load jobs");
      }

      const data = (await response.json()) as JobsResponse;

      setJobs(data.jobs);
      setJobsError("");
      setFallbackMessage(data.fallbackMessage ?? "");
    } catch (error) {
      console.error(error);
      setJobs([]);
      setJobsError("Could not load jobs");
    } finally {
      setIsLoadingJobs(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialJobs() {
      try {
        const response = await fetch("/api/jobs/search");

        if (!response.ok) {
          throw new Error("Could not load jobs");
        }

        const data = (await response.json()) as JobsResponse;

        if (!isMounted) {
          return;
        }

        setJobs(data.jobs);
        setJobsError("");
        setFallbackMessage(data.fallbackMessage ?? "");
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setJobs([]);
        setJobsError("Could not load jobs");
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false);
        }
      }
    }

    void loadInitialJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    jobs,
    isLoadingJobs,
    jobsError,
    refreshJobs: loadJobs,
    fallbackMessage,
  };
}