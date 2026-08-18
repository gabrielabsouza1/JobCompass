"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { Filter } from "lucide-react";
import {
  employmentTypesFromProfileValue,
  serializeEmploymentTypeFilter,
  serializeWorkModeFilter,
  serializeWorkRightsFilter,
  workModesFromProfileValue,
  workRightsFromProfileValue,
} from "@/lib/jobs/extract-filter-options";
import {
  serializeTargetRolesFilter,
  targetRolesFromProfileValue,
  uniqueTargetRoles,
} from "@/lib/profile/target-roles";
import {
  serializeSkillsFilter,
  uniqueSkills,
} from "@/lib/profile/skills";
import { cacheJobs } from "@/lib/jobs/job-session-cache";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { JobCard } from "@/components/jobs/job-card";
import { SmartLinkPanel } from "@/components/jobs/smart-link-panel";
import { JobsFiltersPanel } from "@/components/jobs/jobs-filters-panel";
import { AppToast } from "@/components/ui/app-toast";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJobs } from "@/hooks/use-jobs";
import { useJobSources } from "@/hooks/use-job-sources";
import { hasSelectedInAppSources } from "@/lib/jobs/source-registry";

type JobSortOption = "best_match" | "date_posted";

const JOBS_PER_PAGE = 10;

export default function JobsPage() {
  const { savedJobIds, isJobSaved, toggleSavedJob } = useSavedJobs();
  const { selectedSourceIds } = useJobSources();
  const { toastMessage, showToast } = useToast();
  const { user, isLoadingUser } = useCurrentUser();
  const [sourceFilter, setSourceFilter] = useState("any");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<JobSortOption>("best_match");
  const [currentPage, setCurrentPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<
    string[]
  >([]);
  const [selectedWorkRights, setSelectedWorkRights] = useState<string[]>([]);
  const [targetRoleOptions, setTargetRoleOptions] = useState<string[]>([]);
  const [selectedTargetRoles, setSelectedTargetRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filtersReady, setFiltersReady] = useState(false);
  const jobsTopRef = useRef<HTMLElement>(null);
  const pendingScrollToTopRef = useRef(false);

  const {
    jobs,
    total,
    totalPages,
    filterOptions,
    isLoadingJobs,
    jobsError,
    refreshJobs,
  } = useJobs({
    page: currentPage,
    perPage: JOBS_PER_PAGE,
    query: searchQuery,
    country: countryFilter,
    state: stateFilter,
    city: cityFilter,
    workMode: serializeWorkModeFilter(selectedWorkModes),
    employmentType: serializeEmploymentTypeFilter(selectedEmploymentTypes),
    workRights: serializeWorkRightsFilter(selectedWorkRights),
    targetRoles:
      selectedTargetRoles.length > 0
        ? serializeTargetRolesFilter(selectedTargetRoles)
        : undefined,
    skills:
      selectedSkills.length > 0
        ? serializeSkillsFilter(selectedSkills)
        : undefined,
    source: sourceFilter !== "any" ? sourceFilter : undefined,
    sort: sortBy === "date_posted" ? "date_posted" : undefined,
    enabled: filtersReady,
  });

  const visibleJobs = jobs;

  useEffect(() => {
    if (!user) {
      return;
    }

    setCountryFilter(user.countryName || "any");
    setStateFilter(user.stateName || "any");
    setCityFilter(user.cityName || "any");
    setSelectedWorkModes(
      user.workMode && user.workMode !== "any"
        ? workModesFromProfileValue(user.workMode)
        : []
    );
    setSelectedEmploymentTypes(
      user.employmentType && user.employmentType !== "any"
        ? employmentTypesFromProfileValue(user.employmentType)
        : []
    );
    setSelectedWorkRights(workRightsFromProfileValue(user.workRights));
    const profileRoles = targetRolesFromProfileValue(user.targetRoles);
    setTargetRoleOptions(profileRoles);
    setSelectedTargetRoles([]);
    setFiltersReady(true);
  }, [user]);

  useEffect(() => {
    if (jobs.length > 0) {
      cacheJobs(jobs);
    }
  }, [jobs]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    countryFilter,
    stateFilter,
    cityFilter,
    selectedWorkModes,
    selectedEmploymentTypes,
    selectedWorkRights,
    selectedTargetRoles,
    selectedSkills,
    sourceFilter,
    sortBy,
  ]);

  useEffect(() => {
    if (!pendingScrollToTopRef.current || isLoadingJobs) {
      return;
    }

    pendingScrollToTopRef.current = false;

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    jobsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage, isLoadingJobs]);

  function handlePageChange(page: number) {
    if (page === currentPage) {
      return;
    }

    pendingScrollToTopRef.current = true;
    setCurrentPage(page);
  }

  function renderPagination() {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Button
          type="button"
          variant="outline"
          disabled={currentPage === 1 || isLoadingJobs}
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          className="h-9 rounded-xl border-slate-200"
        >
          Previous
        </Button>

        <p className="text-sm font-semibold text-slate-600">
          Page {currentPage} of {totalPages}
        </p>

        <Button
          type="button"
          variant="outline"
          disabled={currentPage === totalPages || isLoadingJobs}
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          className="h-9 rounded-xl border-slate-200"
        >
          Next
        </Button>
      </div>
    );
  }

  async function handleToggleSavedJob(jobId: string) {
    const job = visibleJobs.find((item) => item.id === jobId);
    const wasSaved = isJobSaved(jobId);

    await toggleSavedJob(jobId, job);

    showToast(wasSaved ? "Job removed from saved" : "Job saved");
  }

  function resetFilters() {
    setSelectedWorkModes([]);
    setSelectedEmploymentTypes([]);
    setSelectedTargetRoles([]);
    setSelectedSkills([]);
    setTargetRoleOptions(targetRolesFromProfileValue(user?.targetRoles));
    setSortBy("best_match");
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setSearchQuery("");
    resetFilters();
  }

  async function handleRefreshJobs() {
    setSearchInput("");
    setSearchQuery("");
    resetFilters();

    await refreshJobs();

    showToast("Jobs refreshed");
  }

  function handleCountryChange(value: string) {
    setCountryFilter(value);
    setStateFilter("any");
    setCityFilter("any");
  }

  function handleStateChange(value: string) {
    setStateFilter(value);
    setCityFilter("any");
  }

  function handleToggleWorkMode(mode: string) {
    setSelectedWorkModes((current) => {
      if (current.includes(mode)) {
        return current.filter((item) => item !== mode);
      }

      return [...current, mode];
    });
  }

  function handleToggleEmploymentType(type: string) {
    setSelectedEmploymentTypes((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type);
      }

      return [...current, type];
    });
  }

  function handleToggleWorkRights(workRight: string) {
    setSelectedWorkRights((current) => {
      if (current.includes(workRight)) {
        return current.filter((item) => item !== workRight);
      }

      return [...current, workRight];
    });
  }

  function handleToggleTargetRole(role: string) {
    setSelectedTargetRoles((current) => {
      if (current.includes(role)) {
        return current.filter((item) => item !== role);
      }

      return [...current, role];
    });
  }

  function handleToggleSkill(skill: string) {
    setSelectedSkills((current) => {
      if (current.includes(skill)) {
        return current.filter((item) => item !== skill);
      }

      return uniqueSkills([...current, skill]);
    });
  }

  function handleAddTargetRole(role: string) {
    const normalized = role.trim();

    if (!normalized) {
      return;
    }

    setTargetRoleOptions((current) => uniqueTargetRoles([...current, normalized]));
    setSelectedTargetRoles((current) =>
      uniqueTargetRoles([...current, normalized])
    );
  }

  const isPageLoading = isLoadingUser || !filtersReady || isLoadingJobs;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Jobs from your selected sources
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Jobs
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Filters start from your profile — change them here for this search
            only.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/saved"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
          >
            Saved jobs
            <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
              {savedJobIds.length}
            </span>
          </Link>

          <Button
            type="button"
            onClick={handleRefreshJobs}
            className="h-10 rounded-xl bg-teal-600 px-5 hover:bg-teal-700"
          >
            Refresh jobs
          </Button>
        </div>
      </div>

      <JobsFiltersPanel
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        countryFilter={countryFilter}
        stateFilter={stateFilter}
        cityFilter={cityFilter}
        selectedWorkModes={selectedWorkModes}
        selectedEmploymentTypes={selectedEmploymentTypes}
        selectedWorkRights={selectedWorkRights}
        targetRoleOptions={targetRoleOptions}
        selectedTargetRoles={selectedTargetRoles}
        skillOptions={user?.skills ?? []}
        selectedSkills={selectedSkills}
        sourceFilter={sourceFilter}
        filterOptions={filterOptions}
        disabled={!filtersReady}
        onCountryChange={handleCountryChange}
        onStateChange={handleStateChange}
        onCityChange={setCityFilter}
        onToggleWorkMode={handleToggleWorkMode}
        onToggleEmploymentType={handleToggleEmploymentType}
        onToggleWorkRights={handleToggleWorkRights}
        onToggleTargetRole={handleToggleTargetRole}
        onAddTargetRole={handleAddTargetRole}
        onToggleSkill={handleToggleSkill}
        onSourceChange={setSourceFilter}
        onReset={resetFilters}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section ref={jobsTopRef}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {total} jobs found
            </p>

            <label className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <Filter className="h-4 w-4" />
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as JobSortOption)
                }
                className="cursor-pointer bg-transparent text-teal-700 outline-none"
                aria-label="Sort jobs"
              >
                <option value="best_match">Sort by best match</option>
                <option value="date_posted">Sort by date posted</option>
              </select>
            </label>
          </div>

          {isPageLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-600">
                Loading jobs...
              </p>
            </div>
          ) : null}

          {jobsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-red-700">{jobsError}</p>
            </div>
          ) : null}

          {!isPageLoading && !jobsError ? (
            <div className="space-y-3">
              {visibleJobs.length > 0 ? (
                <>
                  {visibleJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={isJobSaved(job.id)}
                      onToggleSave={() => {
                        void handleToggleSavedJob(job.id);
                      }}
                    />
                  ))}

                  {renderPagination()}
                </>
              ) : (
                <div className="space-y-4">
                  <EmptyState
                    title={
                      hasSelectedInAppSources(selectedSourceIds)
                        ? "No jobs found"
                        : "No in-app sources selected"
                    }
                    description={
                      hasSelectedInAppSources(selectedSourceIds)
                        ? "Try changing your filters, search terms, or selected job sources."
                        : "Select Adzuna in Sources to see in-app jobs, or use the smart links below to search external platforms."
                    }
                    actionLabel="Reset filters"
                    onAction={clearFilters}
                    secondaryActionLabel="Manage sources"
                    secondaryActionHref="/sources"
                  />

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
                </div>
              )}
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-bold text-slate-950">About match score</h2>

              <p className="mt-2 text-sm text-slate-600">
                Match score shows how well a job matches your profile, skills,
                location and work preferences.
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base relevance</span>
                  <span className="font-semibold text-slate-950">30 pts</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-950">up to 25</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Work mode</span>
                  <span className="font-semibold text-slate-950">up to 20</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Skills match</span>
                  <span className="font-semibold text-slate-950">up to 20</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Employment + work rights</span>
                  <span className="font-semibold text-slate-950">up to 25</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-slate-950">Saved jobs</h2>
                <Link href="/tracker" className="text-sm font-semibold text-teal-700">
                  View all →
                </Link>
              </div>

              <div className="space-y-2">
                {jobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
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

          <Card className="rounded-2xl border-teal-100 bg-teal-50 shadow-sm">
            <CardContent className="p-4">
              <h2 className="font-bold text-slate-950">Get better matches</h2>

              <p className="mt-2 text-sm text-slate-600">
                Complete your profile and add your skills to unlock more
                accurate job recommendations.
              </p>

              <Link
                href="/profile"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Complete profile
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
      <AppToast message={toastMessage} />
    </AppShell>
  );
}
