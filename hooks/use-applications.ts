"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Application } from "@/types/application";
import type { ApplicationStatus } from "@/types";

type ApplicationRow = {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  next_step: string;
  notes: string | null;
  applied_at: string | null;
};

function mapApplicationFromDatabase(row: ApplicationRow): Application {
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
  const [applications, setApplications] = useState<Application[]>([]);
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

  async function addApplication(application: Application) {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
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
      return null;
    }

    const mapped = mapApplicationFromDatabase(data as ApplicationRow);

    setApplications((currentApplications) => [mapped, ...currentApplications]);

    return mapped;
  }

  async function updateApplication(
    applicationId: string,
    updates: Partial<
      Pick<Application, "status" | "nextStep" | "notes" | "appliedAt">
    >
  ) {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const payload: Record<string, string | null> = {};

    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (updates.nextStep !== undefined) {
      payload.next_step = updates.nextStep;
    }

    if (updates.notes !== undefined) {
      payload.notes = updates.notes ?? null;
    }

    if (updates.appliedAt !== undefined) {
      payload.applied_at = updates.appliedAt ?? null;
    }

    if (Object.keys(payload).length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from("applications")
      .update(payload)
      .eq("user_id", user.id)
      .eq("id", applicationId)
      .select("id, job_id, status, next_step, notes, applied_at")
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    const mapped = mapApplicationFromDatabase(data as ApplicationRow);

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId ? mapped : application
      )
    );

    return mapped;
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
    updateApplication,
    resetApplications,
  };
}