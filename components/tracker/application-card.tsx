import Link from "next/link";

import type { Job } from "@/types";
import type { MockApplication } from "@/data/mock-applications";
import { formatSalary } from "@/lib/job-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ApplicationCardProps = {
  job: Job;
  application: MockApplication;
};

export function ApplicationCard({ job, application }: ApplicationCardProps) {
  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

        <p className="mt-1 text-sm text-slate-500">{job.company}</p>

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
          <p className="text-xs font-medium text-slate-500">Next step</p>
          <p className="mt-1 text-sm text-slate-700">
            {application.nextStep}
          </p>
        </div>

        {application.appliedAt ? (
          <p className="mt-3 text-xs text-slate-500">
            Applied at {application.appliedAt}
          </p>
        ) : null}

        {application.notes ? (
          <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-xs leading-5 text-slate-600">
            {application.notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}