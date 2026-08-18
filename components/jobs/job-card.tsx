import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  MapPin,
} from "lucide-react";
import {
  formatPostedAt,
  formatSalary,
  getRiskColor,
  getWorkModeColor,
} from "@/lib/job-utils";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobListingAvatar } from "@/components/jobs/job-listing-avatar";

type JobCardProps = {
  job: Job;
  isSaved: boolean;
  onToggleSave: () => void;
};

export function JobCard({ job, isSaved, onToggleSave }: JobCardProps) {
  return (
    <Card className="relative rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
      <Link
        href={`/jobs/${job.id}`}
        className="absolute inset-0 z-10 rounded-3xl"
        aria-label={`Open ${job.title} job details`}
      />

      <CardContent className="relative z-20 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <JobListingAvatar job={job} />

            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-950">
                  {job.title}
                </h2>

                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  {job.matchScore}% match
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
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

              <div className="mt-3 flex flex-wrap gap-2">
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

                {(job.matchedProfileSkills ?? []).slice(0, 3).map((skill) => (
                  <Badge
                    key={skill}
                    className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  >
                    {skill}
                  </Badge>
                ))}

                {(job.matchedProfileSkills?.length ?? 0) > 3 ? (
                  <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    +{(job.matchedProfileSkills?.length ?? 0) - 3} skills
                  </Badge>
                ) : null}
              </div>

              {(job.skills?.length ?? 0) > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 lg:flex-col lg:items-end">
            <div className="text-left lg:text-right">
              <p className="font-semibold text-slate-950">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Posted {formatPostedAt(job.postedAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleSave();
              }}
              className={`relative z-30 flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                isSaved
                  ? "border-teal-200 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              }`}
              aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
            >
              <Bookmark
                className="h-5 w-5"
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}