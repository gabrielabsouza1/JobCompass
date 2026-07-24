import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { mockJobs } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Salary not listed";

  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()} AUD`;
  }

  if (min) return `From $${min.toLocaleString()} AUD`;
  return `Up to $${max?.toLocaleString()} AUD`;
}

function getWorkModeColor(workMode: string) {
  if (workMode === "Remote") return "bg-purple-50 text-purple-700";
  if (workMode === "Hybrid") return "bg-sky-50 text-sky-700";
  return "bg-emerald-50 text-emerald-700";
}

function getRiskColor(risk: string) {
  if (risk === "High") return "bg-red-50 text-red-700";
  if (risk === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = mockJobs.find((item) => item.id === id);

  if (!job) {
    notFound();
  }

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

                <div className="rounded-3xl bg-teal-50 p-5 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Match score
                  </p>
                  <p className="mt-1 text-5xl font-bold text-teal-700">
                    {job.matchScore}%
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Good match for your profile
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
                  <Bookmark className="mr-2 h-5 w-5" />
                  Save job
                </Button>

                <Button
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 px-6"
                >
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Apply on original site
                  </a>
                </Button>
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

              <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-950">
                  What you might do
                </h3>

                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Review requirements and create test scenarios.</li>
                  <li>• Execute manual tests and document results.</li>
                  <li>• Report bugs clearly using issue tracking tools.</li>
                  <li>• Collaborate with developers and product teams.</li>
                  <li>• Help improve product quality before release.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">
                Skills detected
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
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
                    {job.postedAt}
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
    </AppShell>
  );
}