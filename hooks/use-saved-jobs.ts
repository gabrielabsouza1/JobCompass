"use client";

import { useCallback, useEffect, useState } from "react";

import {
  parseJobSnapshot,
  serializeJobSnapshot,
  type SavedJobRecord,
} from "@/lib/jobs/saved-job-snapshot";
import { createClient } from "@/lib/supabase/client";
import type { Job } from "@/types";

type SavedJobRow = {
  job_id: string;
  job_snapshot: unknown;
  created_at?: string;
};

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshSavedJobs = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedJobs() {
      setIsLoadingSavedJobs(true);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setSavedJobs([]);
        setIsLoadingSavedJobs(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id, job_snapshot, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(error);
        setSavedJobs([]);
        setIsLoadingSavedJobs(false);
        return;
      }

      setSavedJobs(
        ((data as SavedJobRow[]) ?? []).map((row) => ({
          jobId: row.job_id,
          snapshot: parseJobSnapshot(row.job_snapshot),
          savedAt: row.created_at,
        }))
      );
      setIsLoadingSavedJobs(false);
    }

    void loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const savedJobIds = savedJobs.map((item) => item.jobId);

  function isJobSaved(jobId: string) {
    return savedJobIds.includes(jobId);
  }

  function getSavedJob(jobId: string) {
    return savedJobs.find((item) => item.jobId === jobId)?.snapshot ?? null;
  }

  async function toggleSavedJob(jobId: string, job?: Job) {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const alreadySaved = savedJobIds.includes(jobId);

    if (alreadySaved) {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", jobId);

      if (error) {
        console.error(error);
        return;
      }

      setSavedJobs((current) => current.filter((item) => item.jobId !== jobId));

      return;
    }

    const snapshot = job ? serializeJobSnapshot(job) : {};
    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      job_id: jobId,
      job_snapshot: snapshot,
    };

    let { error } = await supabase.from("saved_jobs").insert(insertPayload);

    if (error?.message?.includes("job_snapshot")) {
      ({ error } = await supabase.from("saved_jobs").insert({
        user_id: user.id,
        job_id: jobId,
      }));
    }

    if (error) {
      console.error(error);
      return;
    }

    setSavedJobs((current) => [
      {
        jobId,
        snapshot: job ?? null,
      },
      ...current,
    ]);
  }

  async function resetSavedJobs() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedJobs([]);
      return;
    }

    const { error } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setSavedJobs([]);
  }

  return {
    savedJobs,
    savedJobIds,
    isLoadingSavedJobs,
    isJobSaved,
    getSavedJob,
    toggleSavedJob,
    resetSavedJobs,
    refreshSavedJobs,
  };
}
