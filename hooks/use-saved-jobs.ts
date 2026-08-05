"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function useSavedJobs() {
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedJobs() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setSavedJobIds([]);
        setIsLoadingSavedJobs(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id);

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(error);
        setSavedJobIds([]);
        setIsLoadingSavedJobs(false);
        return;
      }

      setSavedJobIds(data.map((item) => item.job_id));
      setIsLoadingSavedJobs(false);
    }

    loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  function isJobSaved(jobId: string) {
    return savedJobIds.includes(jobId);
  }

  async function toggleSavedJob(jobId: string) {
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

      setSavedJobIds((currentIds) =>
        currentIds.filter((id) => id !== jobId)
      );

      return;
    }

    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      job_id: jobId,
    });

    if (error) {
      console.error(error);
      return;
    }

    setSavedJobIds((currentIds) => [...currentIds, jobId]);
  }

  async function resetSavedJobs() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedJobIds([]);
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

    setSavedJobIds([]);
  }

  return {
    savedJobIds,
    isLoadingSavedJobs,
    isJobSaved,
    toggleSavedJob,
    resetSavedJobs,
  };
}