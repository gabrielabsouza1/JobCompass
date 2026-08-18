import Link from "next/link";

import type { Job, ApplicationStatus } from "@/types";
import type { MockApplication } from "@/data/mock-applications";
import { formatSalary } from "@/lib/job-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Archived",
];

type ApplicationCardProps = {
  job: Job;
  application: MockApplication;
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void;
};

export function ApplicationCard({
  job,
  application,
  onStatusChange,
}: ApplicationCardProps) {
  const canUpdateStatus =
    Boolean(onStatusChange) && !application.id.startsWith("saved-");

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

        {canUpdateStatus ? (
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status
            </label>
            <select
              value={application.status}
              onChange={(event) =>
                onStatusChange?.(
                  application.id,
                  event.target.value as ApplicationStatus
                )
              }
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ) : null}

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
