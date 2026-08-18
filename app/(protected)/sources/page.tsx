"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Globe2,
  Link2,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";

import { jobSources } from "@/data/job-sources";
import { SmartLinkPanel } from "@/components/jobs/smart-link-panel";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppToast } from "@/components/ui/app-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJobSources } from "@/hooks/use-job-sources";
import { useToast } from "@/hooks/use-toast";
import {
  buildSmartSearchParamsFromProfile,
  buildSmartSearchUrl,
} from "@/lib/jobs/smart-links/build-smart-search-url";

type SourceFilter = "all" | "in_app" | "smart_link" | "planned";

function getTypeBadge(type: string) {
  if (type === "In-app results") {
    return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  }

  return "bg-sky-50 text-sky-700 hover:bg-sky-50";
}

function getStatusBadge(status: string) {
  if (status === "Connected") {
    return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  }

  if (status === "Coming soon") {
    return "bg-amber-50 text-amber-700 hover:bg-amber-50";
  }

  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
}

function getIcon(category: string) {
  if (category === "API") return Globe2;
  return ExternalLink;
}

export default function SourcesPage() {
  const { user } = useCurrentUser();
  const { selectedSourceIds, isSourceSelected, toggleSource } = useJobSources();
  const { toastMessage, showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const selectedSources = jobSources.filter((source) =>
    selectedSourceIds.includes(source.id)
  );

  const filteredSources = useMemo(() => {
    return jobSources.filter((source) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        sourceFilter === "all" ||
        (sourceFilter === "in_app" && source.integration === "in_app") ||
        (sourceFilter === "smart_link" && source.integration === "smart_link") ||
        (sourceFilter === "planned" && source.integration === "planned");

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, sourceFilter]);

  const smartSearchParams = buildSmartSearchParamsFromProfile({
    targetRoles: user?.targetRoles,
    cityName: user?.cityName,
    stateName: user?.stateName,
    countryName: user?.countryName,
    workMode: user?.workMode,
  });

  function handleOpenSmartLink(sourceId: string, sourceName: string) {
    const href = buildSmartSearchUrl(sourceId, smartSearchParams);

    if (!href) {
      showToast(`Could not open ${sourceName}`);
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  }

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
            Adzuna powers in-app results today. Smart links open SEEK, LinkedIn
            and other platforms with your profile details pre-filled.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Continue to jobs
        </Link>
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
              <p className="text-sm text-slate-500">In-app APIs live</p>
              <p className="text-3xl font-bold text-slate-950">1</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Link2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Smart links available</p>
              <p className="text-3xl font-bold text-slate-950">
                {
                  jobSources.filter(
                    (source) => source.integration === "smart_link"
                  ).length
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sources"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["in_app", "In-app"],
                ["smart_link", "Smart links"],
                ["planned", "Coming soon"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSourceFilter(value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  sourceFilter === value
                    ? "bg-teal-600 text-white"
                    : "border border-slate-200 text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <SmartLinkPanel
          selectedSourceIds={selectedSourceIds}
          profile={{
            targetRoles: user?.targetRoles,
            cityName: user?.cityName,
            stateName: user?.stateName,
            countryName: user?.countryName,
            workMode: user?.workMode,
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredSources.map((source) => {
          const Icon = getIcon(source.category);
          const isSelected = isSourceSelected(source.id);

          return (
            <Card
              key={source.id}
              className={`rounded-3xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? "border-teal-200 ring-4 ring-teal-50" : ""
              } ${!source.selectable ? "opacity-80" : ""}`}
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

                  {source.selectable ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isSelected && selectedSourceIds.length >= 5) {
                          showToast("You can select up to 5 sources");
                          return;
                        }

                        void toggleSource(source.id);
                      }}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition ${
                        isSelected
                          ? "border-teal-200 bg-teal-600 text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                      }`}
                      aria-label={
                        isSelected
                          ? `Unselect ${source.name}`
                          : `Select ${source.name}`
                      }
                    >
                      {isSelected ? <Check className="h-5 w-5" /> : null}
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={`rounded-full ${getTypeBadge(source.type)}`}>
                    {source.type}
                  </Badge>

                  <Badge className={`rounded-full ${getStatusBadge(source.status)}`}>
                    {source.status}
                  </Badge>
                </div>

                {source.integration === "smart_link" ? (
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex gap-3">
                        <Lock className="mt-0.5 h-4 w-4 text-slate-400" />
                        <p className="text-sm leading-6 text-slate-600">
                          Opens this platform in a new tab with your role and
                          location pre-filled.
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-2xl border-slate-200"
                        onClick={() => handleOpenSmartLink(source.id, source.name)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open {source.name} search
                      </Button>
                    ) : null}
                  </div>
                ) : source.integration === "in_app" ? (
                  <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <p className="text-sm leading-6 text-slate-600">
                        Jobs from this source appear directly inside your
                        JobCompass feed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm leading-6 text-slate-600">
                      This API integration is planned for a future release.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
      <AppToast message={toastMessage} />
    </AppShell>
  );
}
