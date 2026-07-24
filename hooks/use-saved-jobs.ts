"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "jobcompass_saved_jobs";
const EVENT_KEY = "jobcompass_saved_jobs_changed";

function readSavedJobsFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as string[];
  } catch {
    return [];
  }
}

function writeSavedJobsToStorage(jobIds: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobIds));
  window.dispatchEvent(new Event(EVENT_KEY));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_KEY, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT_KEY, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return JSON.stringify(readSavedJobsFromStorage());
}

function getServerSnapshot() {
  return JSON.stringify([]);
}

export function useSavedJobs() {
  const savedJobIdsSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const savedJobIds = JSON.parse(savedJobIdsSnapshot) as string[];

  function isJobSaved(jobId: string) {
    return savedJobIds.includes(jobId);
  }

  function toggleSavedJob(jobId: string) {
    const currentIds = readSavedJobsFromStorage();

    const nextIds = currentIds.includes(jobId)
      ? currentIds.filter((id) => id !== jobId)
      : [...currentIds, jobId];

    writeSavedJobsToStorage(nextIds);
  }

  return {
    savedJobIds,
    isJobSaved,
    toggleSavedJob,
  };
}