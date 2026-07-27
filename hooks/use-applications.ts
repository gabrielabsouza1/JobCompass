"use client";

import { useSyncExternalStore } from "react";
import {
  mockApplications,
  type MockApplication,
} from "@/data/mock-applications";

const STORAGE_KEY = "jobcompass_applications";
const EVENT_KEY = "jobcompass_applications_changed";

function readApplicationsFromStorage(): MockApplication[] {
  if (typeof window === "undefined") {
    return mockApplications;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return mockApplications;
  }

  try {
    return JSON.parse(saved) as MockApplication[];
  } catch {
    return mockApplications;
  }
}

function writeApplicationsToStorage(applications: MockApplication[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
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
  return JSON.stringify(readApplicationsFromStorage());
}

function getServerSnapshot() {
  return JSON.stringify(mockApplications);
}

export function useApplications() {
  const applicationsSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const applications = JSON.parse(applicationsSnapshot) as MockApplication[];

  function addApplication(application: MockApplication) {
    const currentApplications = readApplicationsFromStorage();

    writeApplicationsToStorage([...currentApplications, application]);
  }

  return {
    applications,
    addApplication,
  };
}