import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MessageCircle,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { mockJobs } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const applicationColumns = [
  {
    id: "saved",
    title: "Saved",
    icon: Clock3,
    color: "bg-slate-100 text-slate-700",
    jobs: [mockJobs[0], mockJobs[1]],
  },
  {
    id: "applied",
    title: "Applied",
    icon: FileCheck2,
    color: "bg-sky-50 text-sky-700",
    jobs: [mockJobs[2]],
  },
  {
    id: "interview",
    title: "Interview",
    icon: MessageCircle,
    color: "bg-purple-50 text-purple-700",
    jobs: [mockJobs[0]],
  },
  {
    id: "offer",
    title: "Offer",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
    jobs: [],
  },
  {
    id: "rejected",
    title: "Rejected",
    icon: XCircle,
    color: "bg-red-50 text-red-700",
    jobs: [],
  },
];

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Salary not listed";

  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} AUD`;
  }

  if (min) return `From $${min.toLocaleString()} AUD`;
  return `Up to $${max?.toLocaleString()} AUD`;
}

export default function TrackerPage() {
  const totalApplications = applicationColumns.reduce(
    (total, column) => total + column.jobs.length,
    0
  );

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Application pipeline
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Tracker
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Track saved jobs, applications, interviews and offers in one place.
          </p>
        </div>

        <Button className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
          Add application
        </Button>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Tracked jobs</p>
              <p className="text-3xl font-bold text-slate-950">
                {totalApplications}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <FileCheck2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Applied</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "applied")
                  ?.jobs.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Interviews</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "interview")
                  ?.jobs.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Offers</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "offer")
                  ?.jobs.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="overflow-x-auto pb-4">
        <div className="grid min-w-[1100px] gap-4 xl:grid-cols-5">
          {applicationColumns.map((column) => {
            const Icon = column.icon;

            return (
              <div key={column.id} className="rounded-3xl bg-slate-100 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${column.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        {column.title}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {column.jobs.length} jobs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {column.jobs.length > 0 ? (
                    column.jobs.map((job, index) => (
                      <Card
                        key={`${column.id}-${job.id}-${index}`}
                        className="rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700">
                              {job.source.slice(0, 1)}
                            </div>

                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                              {job.matchScore}%
                            </Badge>
                          </div>

                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="font-bold leading-snug text-slate-950 hover:text-teal-700">
                              {job.title}
                            </h3>
                          </Link>

                          <p className="mt-1 text-sm text-slate-500">
                            {job.company}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">
                              {job.workMode}
                            </Badge>

                            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                              {job.source}
                            </Badge>
                          </div>

                          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500">
                              Next step
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {column.id === "saved"
                                ? "Review job and prepare application."
                                : column.id === "applied"
                                ? "Wait for employer response."
                                : column.id === "interview"
                                ? "Prepare interview notes."
                                : column.id === "offer"
                                ? "Review offer details."
                                : "Archive or follow up later."}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-center">
                      <p className="text-sm font-medium text-slate-500">
                        No jobs yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}