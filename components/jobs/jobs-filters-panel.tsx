"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import type { JobsFilterOptions } from "@/lib/jobs/extract-filter-options";
import {
  ALL_EMPLOYMENT_TYPE_VALUES,
  ALL_WORK_RIGHTS_VALUES,
  formatLocationFilterLabel,
  getCitiesForState,
  getEmploymentTypeLabel,
  getStatesForCountry,
  getWorkModeLabel,
  getWorkRightsLabel,
} from "@/lib/jobs/extract-filter-options";
import { Input } from "@/components/ui/input";

const WORK_MODE_OPTIONS = ["remote", "hybrid", "onsite"] as const;

const selectClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100 disabled:opacity-60";

type JobsFiltersPanelProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  countryFilter: string;
  stateFilter: string;
  cityFilter: string;
  selectedWorkModes: string[];
  selectedEmploymentTypes: string[];
  selectedWorkRights: string[];
  targetRoleOptions: string[];
  selectedTargetRoles: string[];
  sourceFilter: string;
  sortByNewest: boolean;
  filterOptions: JobsFilterOptions | null;
  disabled?: boolean;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onToggleWorkMode: (mode: string) => void;
  onToggleEmploymentType: (type: string) => void;
  onToggleWorkRights: (workRight: string) => void;
  onToggleTargetRole: (role: string) => void;
  onAddTargetRole: (role: string) => void;
  onSourceChange: (value: string) => void;
  onToggleNewest: () => void;
  onReset: () => void;
};

function FilterDivider({ className }: { className?: string }) {
  return (
    <div
      className={`h-6 w-px shrink-0 bg-slate-200 ${className ?? ""}`}
    />
  );
}

function mergeLocationOption(value: string, options: string[]) {
  if (!value || value === "any" || options.includes(value)) {
    return options;
  }

  return [value, ...options];
}

function ActivePill({
  children,
  onClick,
  showChevron = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800"
    >
      {children}
      {showChevron ? <ChevronDown className="h-3.5 w-3.5 opacity-90" /> : null}
    </button>
  );
}

function TogglePill({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-sm font-semibold transition disabled:opacity-60 ${active
        ? "bg-teal-700 text-white hover:bg-teal-800"
        : "border border-slate-300 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        }`}
    >
      {label}
    </button>
  );
}

function NeutralPill({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function JobsFiltersPanel({
  searchInput,
  onSearchInputChange,
  countryFilter,
  stateFilter,
  cityFilter,
  selectedWorkModes,
  selectedEmploymentTypes,
  selectedWorkRights,
  targetRoleOptions,
  selectedTargetRoles,
  sourceFilter,
  sortByNewest,
  filterOptions,
  disabled,
  onCountryChange,
  onStateChange,
  onCityChange,
  onToggleWorkMode,
  onToggleEmploymentType,
  onToggleWorkRights,
  onToggleTargetRole,
  onAddTargetRole,
  onSourceChange,
  onToggleNewest,
  onReset,
}: JobsFiltersPanelProps) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newTargetRoleInput, setNewTargetRoleInput] = useState("");
  const [adzunaCountries, setAdzunaCountries] = useState<string[]>([]);
  const [adzunaStates, setAdzunaStates] = useState<string[]>([]);
  const [adzunaCities, setAdzunaCities] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const locations = filterOptions?.locations ?? [];

  const countryOptions = mergeLocationOption(
    countryFilter,
    adzunaCountries.length > 0
      ? adzunaCountries
      : (filterOptions?.countries ?? [])
  );
  const stateOptions = mergeLocationOption(
    stateFilter,
    adzunaStates.length > 0
      ? adzunaStates
      : getStatesForCountry(locations, countryFilter)
  );
  const cityOptions = mergeLocationOption(
    cityFilter,
    adzunaCities.length > 0
      ? adzunaCities
      : getCitiesForState(locations, countryFilter, stateFilter)
  );

  useEffect(() => {
    if (!showAllFilters) {
      return;
    }

    let cancelled = false;

    async function loadAdzunaLocations() {
      setIsLoadingLocations(true);

      try {
        const params = new URLSearchParams();

        if (countryFilter && countryFilter !== "any") {
          params.set("country", countryFilter);
        }

        if (stateFilter && stateFilter !== "any") {
          params.set("state", stateFilter);
        }

        const query = params.toString();
        const response = await fetch(
          query ? `/api/jobs/locations?${query}` : "/api/jobs/locations"
        );

        if (!response.ok) {
          throw new Error("Could not load location options");
        }

        const data = (await response.json()) as {
          countries?: string[];
          states?: string[];
          cities?: string[];
        };

        if (cancelled) {
          return;
        }

        if (data.countries?.length) {
          setAdzunaCountries(data.countries);
        }

        setAdzunaStates(data.states ?? []);
        setAdzunaCities(data.cities ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadAdzunaLocations();

    return () => {
      cancelled = true;
    };
  }, [showAllFilters, countryFilter, stateFilter]);

  const hasLocationFilter =
    countryFilter !== "any" || stateFilter !== "any" || cityFilter !== "any";

  const locationLabel = hasLocationFilter
    ? formatLocationFilterLabel(cityFilter, stateFilter, countryFilter)
    : "Location";

  const sourceActive = sourceFilter !== "any";

  return (
    <>
      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search jobs, companies, or keywords"
            className="h-9 rounded-full border-slate-200 pl-10 text-sm"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="hidden min-w-0 max-h-[4.5rem] flex-1 flex-wrap items-center gap-x-2 gap-y-2 overflow-hidden sm:flex">
            {hasLocationFilter ? (
              <ActivePill
                showChevron
                onClick={() => setShowAllFilters(true)}
              >
                {locationLabel}
              </ActivePill>
            ) : null}

            {selectedWorkModes.map((mode) => (
              <ActivePill
                key={mode}
                onClick={() => onToggleWorkMode(mode)}
              >
                {getWorkModeLabel(mode)}
              </ActivePill>
            ))}

            {selectedEmploymentTypes.map((type) => (
              <ActivePill
                key={type}
                onClick={() => onToggleEmploymentType(type)}
              >
                {getEmploymentTypeLabel(type)}
              </ActivePill>
            ))}

            {selectedWorkRights.map((workRight) => (
              <ActivePill
                key={workRight}
                onClick={() => onToggleWorkRights(workRight)}
              >
                {getWorkRightsLabel(workRight)}
              </ActivePill>
            ))}

            {selectedTargetRoles.map((role) => (
              <ActivePill key={role} onClick={() => onToggleTargetRole(role)}>
                {role}
              </ActivePill>
            ))}

            {sourceActive ? (
              <ActivePill onClick={() => setShowAllFilters(true)}>
                {sourceFilter}
              </ActivePill>
            ) : null}

            {sortByNewest ? (
              <ActivePill onClick={onToggleNewest}>Newest</ActivePill>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
            <FilterDivider className="hidden sm:block" />

            <NeutralPill
              onClick={() => setShowAllFilters(true)}
              disabled={disabled}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              All filters
            </NeutralPill>

            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="shrink-0 px-1 text-sm font-semibold text-slate-600 transition hover:text-teal-700 disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {showAllFilters ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-base font-bold text-slate-950">All filters</h2>
              <button
                type="button"
                onClick={() => setShowAllFilters(false)}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    value={countryFilter}
                    onChange={(event) => onCountryChange(event.target.value)}
                    className={selectClassName}
                    disabled={disabled || isLoadingLocations}
                  >
                    <option value="any">Any country</option>
                    {countryOptions.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>

                  <select
                    value={stateFilter}
                    onChange={(event) => onStateChange(event.target.value)}
                    className={selectClassName}
                    disabled={
                      disabled ||
                      isLoadingLocations ||
                      countryFilter === "any" ||
                      stateOptions.length === 0
                    }
                  >
                    <option value="any">Any state</option>
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cityFilter}
                    onChange={(event) => onCityChange(event.target.value)}
                    className={selectClassName}
                    disabled={
                      disabled ||
                      isLoadingLocations ||
                      countryFilter === "any" ||
                      cityOptions.length === 0
                    }
                  >
                    <option value="any">Any city</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Work mode
                </p>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODE_OPTIONS.map((mode) => (
                    <TogglePill
                      key={mode}
                      label={getWorkModeLabel(mode)}
                      active={selectedWorkModes.includes(mode)}
                      onClick={() => onToggleWorkMode(mode)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Employment
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_EMPLOYMENT_TYPE_VALUES.map((type) => (
                    <TogglePill
                      key={type}
                      label={getEmploymentTypeLabel(type)}
                      active={selectedEmploymentTypes.includes(type)}
                      onClick={() => onToggleEmploymentType(type)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Work rights
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_WORK_RIGHTS_VALUES.map((workRight) => (
                    <TogglePill
                      key={workRight}
                      label={getWorkRightsLabel(workRight)}
                      active={selectedWorkRights.includes(workRight)}
                      onClick={() => onToggleWorkRights(workRight)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Targeted roles
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAddRoleModal(true)}
                    disabled={disabled}
                    className="text-xs font-semibold text-teal-700 transition hover:text-teal-800 disabled:opacity-60"
                  >
                    + Add role
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {targetRoleOptions.map((role) => (
                    <TogglePill
                      key={role}
                      label={role}
                      active={selectedTargetRoles.includes(role)}
                      onClick={() => onToggleTargetRole(role)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Source
                </span>
                <select
                  value={sourceFilter}
                  onChange={(event) => onSourceChange(event.target.value)}
                  className={selectClassName}
                  disabled={disabled}
                >
                  <option value="any">All sources</option>
                  {filterOptions?.sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={onToggleNewest}
                disabled={disabled}
                className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition ${sortByNewest
                  ? "bg-teal-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-teal-50"
                  }`}
              >
                Newest first
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={onReset}
                className="text-sm font-semibold text-slate-600 hover:text-teal-700"
              >
                Reset filters
              </button>

              <button
                type="button"
                onClick={() => setShowAllFilters(false)}
                className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAddRoleModal ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-base font-bold text-slate-950">Add target role</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAddRoleModal(false);
                  setNewTargetRoleInput("");
                }}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close add role modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Role title
                </span>
                <Input
                  value={newTargetRoleInput}
                  onChange={(event) => setNewTargetRoleInput(event.target.value)}
                  placeholder="e.g. Junior front end developer"
                  className="h-10 rounded-xl border-slate-200 text-sm"
                  disabled={disabled}
                />
              </label>

              <p className="text-xs text-slate-500">
                Jobs are ranked by how many keywords from this role appear in the
                listing.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddRoleModal(false);
                  setNewTargetRoleInput("");
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddTargetRole(newTargetRoleInput);
                  setShowAddRoleModal(false);
                  setNewTargetRoleInput("");
                }}
                disabled={disabled || !newTargetRoleInput.trim()}
                className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                Add role
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
