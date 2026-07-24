import Link from "next/link";
import {
  Check,
  ExternalLink,
  Globe2,
  Link2,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const jobSources = [
  {
    id: "adzuna",
    name: "Adzuna",
    description: "Search Australian jobs directly inside JobCompass.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    selected: true,
    recommended: true,
  },
  {
    id: "jooble",
    name: "Jooble",
    description: "Aggregated job listings from multiple sources.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    selected: true,
    recommended: true,
  },
  {
    id: "remotive",
    name: "Remotive",
    description: "Remote-friendly jobs from global companies.",
    type: "In-app results",
    status: "Available",
    category: "API",
    selected: true,
    recommended: false,
  },
  {
    id: "seek",
    name: "SEEK",
    description: "One of Australia's most popular job platforms.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    selected: true,
    recommended: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Useful for corporate, tech and professional roles.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    selected: true,
    recommended: true,
  },
  {
    id: "indeed",
    name: "Indeed AU",
    description: "Large job search engine with broad role coverage.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    selected: false,
    recommended: false,
  },
  {
    id: "jora",
    name: "Jora",
    description: "Australian job search platform with local listings.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    selected: false,
    recommended: false,
  },
  {
    id: "workforce",
    name: "Workforce Australia",
    description: "Government-backed Australian employment platform.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    selected: false,
    recommended: false,
  },
];

function getTypeBadge(type: string) {
  if (type === "In-app results") {
    return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  }

  return "bg-sky-50 text-sky-700 hover:bg-sky-50";
}

function getIcon(category: string) {
  if (category === "API") return Globe2;
  return ExternalLink;
}

export default function SourcesPage() {
  const selectedSources = jobSources.filter((source) => source.selected);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Choose your job platforms
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Job Sources
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Select up to 5 sources. JobCompass combines in-app job APIs with
            smart search links for major Australian platforms.
          </p>
        </div>

        <Button className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
          Save sources
        </Button>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Check className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Selected sources</p>
              <p className="text-3xl font-bold text-slate-950">
                {selectedSources.length}/5
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Globe2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">In-app APIs</p>
              <p className="text-3xl font-bold text-slate-950">
                {jobSources.filter((source) => source.category === "API").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Link2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Smart links</p>
              <p className="text-3xl font-bold text-slate-950">
                {
                  jobSources.filter((source) => source.category === "External")
                    .length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search sources"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white">
              All
            </button>
            <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
              In-app
            </button>
            <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
              Smart links
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {jobSources.map((source) => {
          const Icon = getIcon(source.category);

          return (
            <Card
              key={source.id}
              className={`rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                source.selected ? "border-teal-200 ring-4 ring-teal-50" : ""
              }`}
            >
              <CardContent className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-950">
                          {source.name}
                        </h2>

                        {source.recommended ? (
                          <Badge className="rounded-full bg-teal-50 text-teal-700 hover:bg-teal-50">
                            Recommended
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {source.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${
                      source.selected
                        ? "border-teal-200 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                    aria-label={`Select ${source.name}`}
                  >
                    {source.selected ? <Check className="h-5 w-5" /> : null}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={`rounded-full ${getTypeBadge(source.type)}`}>
                    {source.type}
                  </Badge>

                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {source.status}
                  </Badge>
                </div>

                {source.category === "External" ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <Lock className="mt-0.5 h-4 w-4 text-slate-400" />
                      <p className="text-sm leading-6 text-slate-600">
                        JobCompass will open this platform with your role,
                        location and work mode already filled in.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <p className="text-sm leading-6 text-slate-600">
                        Jobs from this source can appear directly inside your
                        JobCompass feed.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="mt-8 flex justify-end">
        <Button className="h-12 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
          <Link href="/jobs">Continue to jobs</Link>
        </Button>
      </div>
    </AppShell>
  );
}