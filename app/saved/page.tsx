"use client";

import Link from "next/link";
import { Bookmark, Search } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { AppToast } from "@/components/ui/app-toast";
import { Card, CardContent } from "@/components/ui/card";
import { mockJobs } from "@/data/mock-data";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useToast } from "@/hooks/use-toast";

export default function SavedJobsPage() {
    const { savedJobIds, isJobSaved, toggleSavedJob } = useSavedJobs();
    const { toastMessage, showToast } = useToast();

    const savedJobs = mockJobs.filter((job) => savedJobIds.includes(job.id));

    function handleToggleSavedJob(jobId: string) {
        const wasSaved = isJobSaved(jobId);

        toggleSavedJob(jobId);

        showToast(wasSaved ? "Job removed from saved" : "Job saved");
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
                        Review jobs you saved and decide which ones should move into your
                        application tracker.
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

            {savedJobs.length > 0 ? (
                <section className="space-y-4">
                    {savedJobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isSaved={isJobSaved(job.id)}
                            onToggleSave={() => handleToggleSavedJob(job.id)}
                        />
                    ))}
                </section>
            ) : (
                <Card className="rounded-4xl border-dashed border-slate-300 bg-white shadow-sm">
                    <CardContent className="p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                            <Bookmark className="h-8 w-8" />
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-slate-950">
                            No saved jobs yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            Save jobs from your job feed to review them later or move them
                            into your application tracker.
                        </p>

                        <Link
                            href="/jobs"
                            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                            Browse jobs
                        </Link>
                    </CardContent>
                </Card>
            )}

            <AppToast message={toastMessage} />
        </AppShell>
    );
}