"use client";

import {
  BriefcaseBusiness,
  Bookmark,
  CalendarDays,
  Send,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { mockJobs } from "@/data/mock-data";
import { TopJobCard } from "@/components/dashboard/top-job-card";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useApplications } from "@/hooks/use-applications";
import { useJobSources } from "@/hooks/use-job-sources";
import { useCurrentUser } from "@/hooks/use-current-user";
import { calculateMatchScore } from "@/lib/jobs/calculate-match-score";

function StatCard({
  label,
  value,
  icon: Icon,
  helper,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  helper?: string;
  href?: string;
}) {
  const content = (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-xs font-medium text-teal-700">{helper}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export default function DashboardPage() {
  const { savedJobIds } = useSavedJobs();
  const { applications } = useApplications();
  const { selectedSourceIds } = useJobSources();
  const { user } = useCurrentUser();

  const visibleJobs = mockJobs.filter((job) =>
    selectedSourceIds.some((sourceId) =>
      job.source.toLowerCase().includes(sourceId.toLowerCase())
    )
  );

  const matchedJobs = visibleJobs
  .map((job) => ({
    ...job,
    matchScore: user ? calculateMatchScore(job, user) : job.matchScore,
  }))
  .sort((a, b) => b.matchScore - a.matchScore);

  const interviewsUpcoming = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const applicationsSent = applications.filter(
    (application) =>
      application.status === "Applied" ||
      application.status === "Interview" ||
      application.status === "Offer" ||
      application.status === "Rejected"
  ).length;

  const workRightsWarnings = visibleJobs.filter(
    (job) => job.workRightsRisk === "Medium" || job.workRightsRisk === "High"
  ).length;

  const bestSource =
    visibleJobs.length > 0
      ? visibleJobs.reduce<Record<string, number>>((acc, job) => {
        acc[job.source] = (acc[job.source] ?? 0) + 1;
        return acc;
      }, {})
      : {};

  const bestSourceName =
    Object.entries(bestSource).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "No source";

  return (
    <AppShell>
      <section className="mb-8 overflow-hidden rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              Australia-focused job search
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
              Good morning,{" "}
              <span className="text-teal-600">
                {user?.fullName.split(" ")[0] ?? "there"}
              </span>{" "}
              👋
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Let’s find the right opportunity for you across trusted Australian
              job platforms.
            </p>
          </div>

          <div className="rounded-4xl bg-linear-to-br from-sky-50 to-teal-50 p-8 text-center">
            <div className="text-7xl">🧭</div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              Melbourne, VIC · Hybrid roles · 5 selected sources
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="New jobs found"
          value={visibleJobs.length}
          icon={BriefcaseBusiness}
          helper="From selected sources"
          href="/jobs"
        />

        <StatCard
          label="Saved jobs"
          value={savedJobIds.length}
          icon={Bookmark}
          helper="View saved jobs"
          href="/saved"
        />

        <StatCard
          label="Applications sent"
          value={applicationsSent}
          icon={Send}
          helper="Tracked applications"
          href="/tracker"
        />

        <StatCard
          label="Interviews upcoming"
          value={interviewsUpcoming}
          icon={CalendarDays}
          helper="View tracker"
          href="/tracker"
        />

        <StatCard
          label="Best source"
          value={bestSourceName}
          icon={TrendingUp}
          helper="Based on visible jobs"
          href="/sources"
        />
      </section>

      <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Work rights warnings found: {workRightsWarnings}
            </h2>
            <p className="text-sm text-slate-600">
              Some job ads may include work rights language that needs review.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Top matched jobs today
          </h2>

          <Link href="/jobs" className="text-sm font-semibold text-teal-700">
            View all jobs →
          </Link>
        </div>

        {visibleJobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {matchedJobs.slice(0, 3).map((job) => (
              <TopJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matched jobs yet"
            description="Your selected sources do not have matching mock jobs right now. Try managing your job sources to see more opportunities."
            actionLabel="Manage job sources"
            actionHref="/sources"
          />
        )}
      </section>
    </AppShell>
  );
}