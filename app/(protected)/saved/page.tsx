"use client";

import Link from "next/link";
import { Bookmark, ClipboardCheck, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { AppToast } from "@/components/ui/app-toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useApplicationTracker } from "@/hooks/use-application-tracker";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";

export default function SavedJobsPage() {
  const { savedJobs, isJobSaved, toggleSavedJob } = useSavedJobs();
  const { trackJob } = useApplicationTracker();
  const { toastMessage, showToast } = useToast();

  const savedJobCards = savedJobs
    .map((record) => record.snapshot)
    .filter((job): job is NonNullable<typeof job> => job !== null);

  async function handleToggleSavedJob(jobId: string) {
    const job = savedJobs.find((item) => item.jobId === jobId)?.snapshot;
    const wasSaved = isJobSaved(jobId);

    await toggleSavedJob(jobId, job ?? undefined);

    showToast(wasSaved ? "Job removed from saved" : "Job saved");
  }

  async function handleTrackJob(jobId: string) {
    const job = savedJobs.find((item) => item.jobId === jobId)?.snapshot;

    if (!job) {
      showToast("Could not track this job");
      return;
    }

    const tracked = await trackJob(job);

    if (tracked) {
      showToast("Added to tracker");
    } else {
      showToast("Could not add to tracker");
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Saved opportunities
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Saved Jobs
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Review jobs you saved and move them into your application tracker.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Search className="mr-2 h-4 w-4" />
          Browse jobs
        </Link>
      </div>

      {savedJobCards.length > 0 ? (
        <section className="space-y-4">
          {savedJobCards.map((job) => (
            <div key={job.id} className="space-y-3">
              <JobCard
                job={job}
                isSaved={isJobSaved(job.id)}
                onToggleSave={() => {
                  void handleToggleSavedJob(job.id);
                }}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void handleTrackJob(job.id);
                  }}
                  className="h-10 rounded-2xl border-slate-200"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Add to tracker
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : savedJobs.length > 0 ? (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="Saved jobs need a refresh"
          description="Some saved jobs were stored before job snapshots existed. Save them again from the jobs feed to see full details here."
          actionLabel="Browse jobs"
          actionHref="/jobs"
        />
      ) : (
        <EmptyState
          icon={<Bookmark className="h-8 w-8" />}
          title="No saved jobs yet"
          description="Save jobs from your job feed to review them later or move them into your application tracker."
          actionLabel="Browse jobs"
          actionHref="/jobs"
        />
      )}

      <AppToast message={toastMessage} />
    </AppShell>
  );
}
