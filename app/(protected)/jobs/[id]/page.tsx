"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  formatPostedAt,
  formatSalary,
  getRiskColor,
  getWorkModeColor,
} from "@/lib/job-utils";
import { getCachedJob } from "@/lib/jobs/job-session-cache";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApplicationTracker } from "@/hooks/use-application-tracker";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { AppToast } from "@/components/ui/app-toast";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/types";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const { trackJob } = useApplicationTracker();
  const { toastMessage, showToast } = useToast();
  const { user } = useCurrentUser();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const jobId = params.id;

    async function loadJob() {
      setIsLoading(true);
      setLoadError("");

      const cachedJob = getCachedJob(jobId);

      if (cachedJob) {
        if (isMounted) {
          setJob(cachedJob);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Job not found");
        }

        const data = (await response.json()) as { job?: Job };

        if (!isMounted) {
          return;
        }

        setJob(data.job ?? null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error(error);

        if (isMounted) {
          setJob(null);
          setLoadError("This job is no longer available.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadJob();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [params.id]);

  async function handleToggleSavedJob() {
    if (!job) {
      return;
    }

    const wasSaved = isJobSaved(job.id);

    await toggleSavedJob(job.id, job);

    showToast(wasSaved ? "Job removed from saved" : "Job saved");
  }

  async function handleTrackJob() {
    if (!job) {
      return;
    }

    if (!isJobSaved(job.id)) {
      await toggleSavedJob(job.id, job);
    }

    const tracked = await trackJob(job);

    if (tracked) {
      showToast("Added to tracker");
    } else {
      showToast("Could not add to tracker");
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Loading job...</p>
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">
            Job not found
          </h1>
          <p className="mt-2 text-slate-600">
            {loadError || "This job does not exist or is no longer available."}
          </p>

          <Link
            href="/jobs"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Back to jobs
          </Link>
        </div>
      </AppShell>
    );
  }

  const matchedSkills = job.matchedProfileSkills ?? [];
  const missingSkills = job.missingProfileSkills ?? [];

  return (
    <AppShell>
      <div className="mb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
                    {job.source.slice(0, 1)}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {job.matchScore}% match
                    </Badge>

                    <Badge
                      className={`rounded-full hover:bg-current ${getWorkModeColor(
                        job.workMode
                      )}`}
                    >
                      {job.workMode}
                    </Badge>

                    <Badge className="rounded-full bg-teal-50 text-teal-700 hover:bg-teal-50">
                      {job.employmentType}
                    </Badge>

                    <Badge
                      className={`rounded-full hover:bg-current ${getRiskColor(
                        job.workRightsRisk
                      )}`}
                    >
                      {job.workRightsRisk} work rights risk
                    </Badge>
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                    {job.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <BriefcaseBusiness className="h-4 w-4" />
                      via {job.source}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button
                    type="button"
                    onClick={() => {
                      void handleToggleSavedJob();
                    }}
                    className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-700"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    {isJobSaved(job.id) ? "Saved" : "Save job"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200"
                    onClick={() => {
                      void handleTrackJob();
                    }}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Track application
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200"
                    onClick={() => window.open(job.url, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open original
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">
                Job description
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {job.description}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">
                Skills detected
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No catalog skills detected in this listing yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-950">Your skill match</h2>

              <p className="mt-2 text-sm text-slate-600">
                {user?.skills?.length
                  ? `${matchedSkills.length} of ${user.skills.length} profile skills appear in this job.`
                  : "Add skills to your profile to see personalized matches."}
              </p>

              {matchedSkills.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    You have
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {missingSkills.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Not mentioned
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {missingSkills.slice(0, 6).map((skill) => (
                      <Badge
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-slate-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-950">Job overview</h2>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-slate-500">Salary</p>
                  <p className="font-semibold text-slate-950">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="font-semibold text-slate-950">
                    {job.location}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Work mode</p>
                  <p className="font-semibold text-slate-950">
                    {job.workMode}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Employment type</p>
                  <p className="font-semibold text-slate-950">
                    {job.employmentType}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Posted</p>
                  <p className="font-semibold text-slate-950">
                    {formatPostedAt(job.postedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Work rights note</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This job has a{" "}
                <span className="font-semibold">
                  {job.workRightsRisk.toLowerCase()}
                </span>{" "}
                work rights risk based on detected wording. This is only a
                warning, not legal or migration advice.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-teal-100 bg-teal-50 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Next step</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Later, JobCompass will help tailor your resume and generate a
                cover letter for this job.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <AppToast message={toastMessage} />
    </AppShell>
  );
}
