"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

import type { JobsFilterOptions } from "@/lib/jobs/extract-filter-options";
import {
  getCitiesForState,
  getEmploymentTypeLabel,
  getStatesForCountry,
  getWorkModeLabel,
  getWorkRightsRiskLabel,
} from "@/lib/jobs/extract-filter-options";
import { Input } from "@/components/ui/input";

const selectClassName =
  "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100 disabled:opacity-60";

type JobsFiltersPanelProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  countryFilter: string;
  stateFilter: string;
  cityFilter: string;
  workModeFilter: string;
  employmentTypeFilter: string;
  workRightsFilter: string;
  sourceFilter: string;
  sortByNewest: boolean;
  filterOptions: JobsFilterOptions | null;
  disabled?: boolean;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onWorkModeChange: (value: string) => void;
  onEmploymentTypeChange: (value: string) => void;
  onWorkRightsChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onToggleNewest: () => void;
};

function FilterField({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

export function JobsFiltersPanel({
  searchInput,
  onSearchInputChange,
  countryFilter,
  stateFilter,
  cityFilter,
  workModeFilter,
  employmentTypeFilter,
  workRightsFilter,
  sourceFilter,
  sortByNewest,
  filterOptions,
  disabled,
  onCountryChange,
  onStateChange,
  onCityChange,
  onWorkModeChange,
  onEmploymentTypeChange,
  onWorkRightsChange,
  onSourceChange,
  onToggleNewest,
}: JobsFiltersPanelProps) {
  const locations = filterOptions?.locations ?? [];
  const stateOptions = getStatesForCountry(locations, countryFilter);
  const cityOptions = getCitiesForState(
    locations,
    countryFilter,
    stateFilter
  );

  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search jobs, companies, or keywords"
            className="h-10 rounded-xl border-slate-200 pl-10 text-sm"
            disabled={disabled}
          />
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Location
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <FilterField
              label="Country"
              value={countryFilter}
              onChange={onCountryChange}
              disabled={disabled}
            >
              <option value="any">Any</option>
              {filterOptions?.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </FilterField>

            <FilterField
              label="State"
              value={stateFilter}
              onChange={onStateChange}
              disabled={disabled}
            >
              <option value="any">Any</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </FilterField>

            <FilterField
              label="City"
              value={cityFilter}
              onChange={onCityChange}
              disabled={disabled}
            >
              <option value="any">Any</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </FilterField>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <FilterField
            label="Work mode"
            value={workModeFilter}
            onChange={onWorkModeChange}
            disabled={disabled}
          >
            <option value="any">Any</option>
            {filterOptions?.workModes.map((mode) => (
              <option key={mode} value={mode.toLowerCase()}>
                {getWorkModeLabel(mode.toLowerCase())}
              </option>
            ))}
          </FilterField>

          <FilterField
            label="Employment"
            value={employmentTypeFilter}
            onChange={onEmploymentTypeChange}
            disabled={disabled}
          >
            <option value="any">Any</option>
            {filterOptions?.employmentTypes.map((type) => (
              <option key={type} value={type}>
                {getEmploymentTypeLabel(type)}
              </option>
            ))}
          </FilterField>

          <FilterField
            label="Work rights"
            value={workRightsFilter}
            onChange={onWorkRightsChange}
            disabled={disabled}
          >
            <option value="any">Any</option>
            {filterOptions?.workRightsRisks.map((risk) => (
              <option key={risk} value={risk.toLowerCase()}>
                {getWorkRightsRiskLabel(risk)}
              </option>
            ))}
          </FilterField>

          <FilterField
            label="Source"
            value={sourceFilter}
            onChange={onSourceChange}
            disabled={disabled}
          >
            <option value="any">All sources</option>
            {filterOptions?.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </FilterField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <p className="text-xs text-slate-500">
            Filters apply to this search only — your profile stays unchanged.
          </p>

          <button
            type="button"
            onClick={onToggleNewest}
            disabled={disabled}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${sortByNewest
              ? "bg-teal-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              }`}
          >
            Newest first
          </button>
        </div>
      </div>
    </section>
  );
}
