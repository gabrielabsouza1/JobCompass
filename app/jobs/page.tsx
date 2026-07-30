"use client";

import Link from "next/link";
import { useState } from "react";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import {
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { getPostedAtValue } from "@/lib/job-utils";
import { AppShell } from "@/components/layout/app-shell";
import { mockJobs } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/job-card";
import { AppToast } from "@/components/ui/app-toast";

export default function JobsPage() {
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const [sourceFilter, setSourceFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByNewest, setSortByNewest] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [workModeFilter, setWorkModeFilter] = useState<
    "All" | "Remote" | "Hybrid" | "Onsite"
  >("All");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesWorkMode =
      workModeFilter === "All" || job.workMode === workModeFilter;

    const matchesSource =
      sourceFilter === "All" || job.source === sourceFilter;

    const searchText = [
      job.title,
      job.company,
      job.location,
      job.source,
      job.employmentType,
      ...job.skills,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(searchQuery.toLowerCase());

    return matchesWorkMode && matchesSource && matchesSearch;
  });

  const visibleJobs = [...filteredJobs].sort((a, b) => {
    if (!sortByNewest) {
      return b.matchScore - a.matchScore;
    }

    return getPostedAtValue(a.postedAt) - getPostedAtValue(b.postedAt);
  });

  const availableSources = ["All", ...new Set(mockJobs.map((job) => job.source))];

  function showToast(message: string) {
  setToastMessage(message);

  window.setTimeout(() => {
    setToastMessage("");
  }, 2500);
}

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
            Jobs from your selected sources
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Jobs
          </h1>

          <p className="mt-2 text-slate-600">
            Browse jobs matched to your profile, location and work preferences.
          </p>
        </div>

        <Button className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
          Refresh jobs
        </Button>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search jobs, companies, or keywords"
              className="h-12 rounded-2xl border-slate-200 pl-12"
            />
          </div>

          <Button
            variant="outline"
            className="h-12 rounded-2xl border-slate-200"
          >
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filters
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {["All", "Remote", "Hybrid", "Onsite"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                setWorkModeFilter(mode as "All" | "Remote" | "Hybrid" | "Onsite")
              }
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${workModeFilter === mode
                ? "bg-teal-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                }`}
            >
              {mode === "All" ? "All Jobs" : mode}
            </button>
          ))}

          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 outline-none transition hover:bg-teal-50 hover:text-teal-700"
          >
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source === "All" ? "All sources" : source}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSortByNewest((current) => !current)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${sortByNewest
              ? "bg-teal-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              }`}
          >
            Newest
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {visibleJobs.length} jobs found
            </p>

            <button className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <Filter className="h-4 w-4" />
              {sortByNewest ? "Sort by newest" : "Sort by best match"}
            </button>
          </div>

          <div className="space-y-4">
            {visibleJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={isJobSaved(job.id)}
                onToggleSave={() => handleToggleSavedJob(job.id)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-950">About match score</h2>

              <p className="mt-2 text-sm text-slate-600">
                Match score shows how well a job matches your profile, skills,
                location and work preferences.
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Skills & experience</span>
                  <span className="font-semibold text-slate-950">45%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Job preferences</span>
                  <span className="font-semibold text-slate-950">30%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Location & work type</span>
                  <span className="font-semibold text-slate-950">15%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Recency</span>
                  <span className="font-semibold text-slate-950">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-950">Saved jobs</h2>
                <Link href="/tracker" className="text-sm font-semibold text-teal-700">
                  View all →
                </Link>
              </div>

              <div className="space-y-3">
                {mockJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500">{job.company}</p>
                    </div>

                    <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {job.matchScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-teal-100 bg-teal-50 shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-950">Get better matches</h2>

              <p className="mt-2 text-sm text-slate-600">
                Complete your profile and add your skills to unlock more
                accurate job recommendations.
              </p>

              <Button className="mt-5 h-11 rounded-2xl bg-teal-600 hover:bg-teal-700">
                Complete profile
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <AppToast message={toastMessage} />
    </AppShell>
  );
}