"use client";

import { useEffect, useState } from "react";

import type { Job } from "@/types";

const ADZUNA_LOGO_SRC = "/images/adzuna-logo.png";

type JobListingAvatarProps = {
  job: Job;
  imageClassName?: string;
};

export function JobListingAvatar({
  job,
  imageClassName,
}: JobListingAvatarProps) {
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState<string | null>(null);
  const [companyLogoFailed, setCompanyLogoFailed] = useState(false);
  const [trackedCompanyLogoUrl, setTrackedCompanyLogoUrl] = useState(
    job.companyLogoUrl ?? null
  );

  if ((job.companyLogoUrl ?? null) !== trackedCompanyLogoUrl) {
    setTrackedCompanyLogoUrl(job.companyLogoUrl ?? null);
    setFetchedLogoUrl(null);
    setCompanyLogoFailed(false);
  }

  useEffect(() => {
    if (job.companyLogoUrl || !job.url.includes("adzuna")) {
      return;
    }

    let cancelled = false;

    async function loadLogo() {
      try {
        const params = new URLSearchParams({ redirect: job.url });
        const response = await fetch(`/api/jobs/logo?${params.toString()}`);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { url?: string | null };

        if (!cancelled && data.url) {
          setFetchedLogoUrl(data.url);
          setCompanyLogoFailed(false);
        }
      } catch {
        // Fall back to the Adzuna logo.
      }
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [job.companyLogoUrl, job.id, job.url]);

  const resolvedLogoUrl =
    (job.companyLogoUrl ?? fetchedLogoUrl) && !companyLogoFailed
      ? (job.companyLogoUrl ?? fetchedLogoUrl)!
      : ADZUNA_LOGO_SRC;

  return (
    <img
      src={resolvedLogoUrl}
      alt=""
      className={
        imageClassName ??
        "h-16 w-16 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-2"
      }
      onError={() => {
        if (resolvedLogoUrl === ADZUNA_LOGO_SRC) {
          return;
        }

        setCompanyLogoFailed(true);
      }}
    />
  );
}
