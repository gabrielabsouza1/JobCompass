"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "jobcompass_selected_sources";
const EVENT_KEY = "jobcompass_selected_sources_changed";

const DEFAULT_SELECTED_SOURCES = [
  "adzuna",
  "jooble",
  "remotive",
  "seek",
  "linkedin",
];

function readSelectedSourcesFromStorage(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_SELECTED_SOURCES;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return DEFAULT_SELECTED_SOURCES;
  }

  try {
    return JSON.parse(saved) as string[];
  } catch {
    return DEFAULT_SELECTED_SOURCES;
  }
}

function writeSelectedSourcesToStorage(sourceIds: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sourceIds));
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
  return JSON.stringify(readSelectedSourcesFromStorage());
}

function getServerSnapshot() {
  return JSON.stringify(DEFAULT_SELECTED_SOURCES);
}

export function useJobSources() {
  const selectedSourcesSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const selectedSourceIds = JSON.parse(selectedSourcesSnapshot) as string[];

  function isSourceSelected(sourceId: string) {
    return selectedSourceIds.includes(sourceId);
  }

  function toggleSource(sourceId: string) {
    const currentSourceIds = readSelectedSourcesFromStorage();

    if (currentSourceIds.includes(sourceId)) {
      writeSelectedSourcesToStorage(
        currentSourceIds.filter((id) => id !== sourceId)
      );
      return;
    }

    if (currentSourceIds.length >= 5) {
      return;
    }

    writeSelectedSourcesToStorage([...currentSourceIds, sourceId]);
  }

  function resetSources() {
    writeSelectedSourcesToStorage(DEFAULT_SELECTED_SOURCES);
  }

  return {
    selectedSourceIds,
    isSourceSelected,
    toggleSource,
    resetSources,
  };
}