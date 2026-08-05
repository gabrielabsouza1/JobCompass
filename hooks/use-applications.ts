"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { MockApplication } from "@/data/mock-applications";
import type { ApplicationStatus } from "@/types";

type ApplicationRow = {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  next_step: string;
  notes: string | null;
  applied_at: string | null;
};

function mapApplicationFromDatabase(row: ApplicationRow): MockApplication {
  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    nextStep: row.next_step,
    notes: row.notes ?? undefined,
    appliedAt: row.applied_at ?? undefined,
  };
}

export function useApplications() {
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setApplications([]);
        setIsLoadingApplications(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("id, job_id, status, next_step, notes, applied_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(error);
        setApplications([]);
        setIsLoadingApplications(false);
        return;
      }

      setApplications((data as ApplicationRow[]).map(mapApplicationFromDatabase));
      setIsLoadingApplications(false);
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  async function addApplication(application: MockApplication) {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_id: application.jobId,
        status: application.status,
        next_step: application.nextStep,
        notes: application.notes ?? null,
        applied_at: application.appliedAt ?? null,
      })
      .select("id, job_id, status, next_step, notes, applied_at")
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setApplications((currentApplications) => [
      mapApplicationFromDatabase(data as ApplicationRow),
      ...currentApplications,
    ]);
  }

  async function resetApplications() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setApplications([]);
      return;
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setApplications([]);
  }

  return {
    applications,
    isLoadingApplications,
    addApplication,
    resetApplications,
  };
}