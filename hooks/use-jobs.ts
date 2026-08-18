"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  JobsFilterDefaults,
  JobsFilterOptions,
} from "@/lib/jobs/extract-filter-options";
import type { Job } from "@/types";

export type UseJobsFilters = {
  page?: number;
  perPage?: number;
  query?: string;
  country?: string;
  state?: string;
  city?: string;
  workMode?: string;
  employmentType?: string;
  workRights?: string;
  targetRoles?: string;
  skills?: string;
  source?: string;
  sort?: string;
  enabled?: boolean;
};

type JobsResponse = {
  jobs: Job[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  fallbackMessage?: string;
  defaults?: JobsFilterDefaults;
  filters?: JobsFilterOptions;
};

function buildSearchUrl(filters: UseJobsFilters) {
  const params = new URLSearchParams();

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 10;

  params.set("page", String(page));
  params.set("perPage", String(perPage));

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }

  if (filters.country) {
    params.set("country", filters.country);
  }

  if (filters.state) {
    params.set("state", filters.state);
  }

  if (filters.city) {
    params.set("city", filters.city);
  }

  if (filters.workMode) {
    params.set("workMode", filters.workMode);
  }

  if (filters.employmentType) {
    params.set("employmentType", filters.employmentType);
  }

  if (filters.workRights) {
    params.set("workRights", filters.workRights);
  }

  if (filters.targetRoles?.trim()) {
    params.set("targetRoles", filters.targetRoles.trim());
  }

  if (filters.skills) {
    params.set("skills", filters.skills);
  }

  if (filters.source) {
    params.set("source", filters.source);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  return `/api/jobs/search?${params.toString()}`;
}

export function useJobs(filters?: UseJobsFilters) {
  const enabled = filters?.enabled ?? true;
  const page = filters?.page ?? 1;
  const perPage = filters?.perPage ?? 10;
  const query = filters?.query ?? "";
  const country = filters?.country ?? "";
  const state = filters?.state ?? "";
  const city = filters?.city ?? "";
  const workMode = filters?.workMode ?? "";
  const employmentType = filters?.employmentType ?? "";
  const workRights = filters?.workRights ?? "";
  const targetRoles = filters?.targetRoles ?? "";
  const skills = filters?.skills;
  const source = filters?.source;
  const sort = filters?.sort;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterOptions, setFilterOptions] = useState<JobsFilterOptions | null>(
    null
  );
  const [profileDefaults, setProfileDefaults] =
    useState<JobsFilterDefaults | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    async function loadJobs() {
      setIsLoadingJobs(true);
      setJobsError("");

      try {
        const response = await fetch(
          buildSearchUrl({
            page,
            perPage,
            query,
            country,
            state,
            city,
            workMode,
            employmentType,
            workRights,
            targetRoles,
            skills,
            source,
            sort,
          })
        );

        if (!response.ok) {
          throw new Error("Could not load jobs");
        }

        const data = (await response.json()) as JobsResponse;

        if (!isMounted) {
          return;
        }

        setJobs(data.jobs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setFilterOptions(data.filters ?? null);
        setProfileDefaults(data.defaults ?? null);
        setJobsError("");
        setFallbackMessage(data.fallbackMessage ?? "");
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        setJobs([]);
        setTotal(0);
        setTotalPages(0);
        setJobsError("Could not load jobs");
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false);
        }
      }
    }

    void loadJobs();

    return () => {
      isMounted = false;
    };
  }, [
    enabled,
    page,
    perPage,
    query,
    country,
    state,
    city,
    workMode,
    employmentType,
    workRights,
    targetRoles,
    skills,
    source,
    sort,
    reloadKey,
  ]);

  const refreshJobs = useCallback(async () => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    jobs,
    total,
    totalPages,
    filterOptions,
    profileDefaults,
    isLoadingJobs,
    jobsError,
    refreshJobs,
    fallbackMessage,
  };
}
