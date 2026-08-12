import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobListingAvatar } from "@/components/jobs/job-listing-avatar";

type TopJobCardProps = {
  job: Job;
};

export function TopJobCard({ job }: TopJobCardProps) {
  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <JobListingAvatar
            job={job}
            imageClassName="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-1.5"
          />

          <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            {job.matchScore}% match
          </Badge>
        </div>

        <h3 className="font-semibold text-slate-950">{job.title}</h3>
        <p className="text-sm text-slate-500">{job.company}</p>
        <p className="mt-2 text-sm text-slate-500">{job.location}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50">
            {job.workMode}
          </Badge>

          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
            {job.source}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}