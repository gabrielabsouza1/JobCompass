import type { Job } from "@/types";

import { getPostedAtValue } from "@/lib/job-utils";
import {
  calculateMatchScore,
  getJobSkillMatchDetails,
} from "@/lib/jobs/calculate-match-score";
import { jobMatchesSearchFilters } from "@/lib/jobs/extract-filter-options";
import { compareJobsByTargetRoles } from "@/lib/jobs/target-role-matching";

const ADZUNA_BATCH_SIZE = 50;
const MAX_ADZUNA_BATCHES = 8;

type ProfileMatchContext = {
  countryName: string;
  stateName: string;
  cityName: string;
  workMode: string;
  employmentType: string;
  workRights: string;
  skills: string[];
};

type JobSearchFilterOptions = {
  selectedSourceIds: string[];
  source?: string | null;
  workMode?: string | null;
  employmentType?: string | null;
  workRights?: string | null;
  skills?: string[];
  targetRoles?: string[];
};

type FetchJobBatch = (
  page: number,
  perPage: number
) => Promise<{ jobs: Job[]; total: number }>;

function enrichJobsWithMatchScores(
  jobs: Job[],
  filterOptions: JobSearchFilterOptions,
  profileContext: ProfileMatchContext
) {
  return jobs
    .filter((job) => jobMatchesSearchFilters(job, filterOptions))
    .map((job) => {
      const skillMatch = getJobSkillMatchDetails(job, profileContext);

      return {
        ...job,
        matchScore: calculateMatchScore(job, profileContext),
        matchedProfileSkills: skillMatch.matchedSkills,
        missingProfileSkills: skillMatch.missingSkills,
      };
    });
}

function appendUniqueJobs(
  jobs: Job[],
  catalog: Job[],
  seenJobIds: Set<string>
) {
  for (const job of jobs) {
    if (seenJobIds.has(job.id)) {
      continue;
    }

    seenJobIds.add(job.id);
    catalog.push(job);
  }
}

function sortJobsByBestMatch(
  jobs: Job[],
  activeTargetRoles: string[]
) {
  const sorted = [...jobs];

  sorted.sort((left, right) => {
    const roleCompare = compareJobsByTargetRoles(
      left,
      right,
      activeTargetRoles
    );

    if (roleCompare !== 0) {
      return roleCompare;
    }

    return right.matchScore - left.matchScore;
  });

  return sorted;
}

function sortJobsByDatePosted(jobs: Job[]) {
  return [...jobs].sort(
    (left, right) => getPostedAtValue(right.postedAt) - getPostedAtValue(left.postedAt)
  );
}

function estimatePaginatedTotal(
  filteredIndex: number,
  scannedRaw: number,
  providerTotal: number,
  scannedAll: boolean
) {
  if (scannedAll) {
    return filteredIndex;
  }

  if (scannedRaw <= 0 || filteredIndex <= 0) {
    return providerTotal;
  }

  const estimated = Math.round((filteredIndex / scannedRaw) * providerTotal);

  return Math.min(providerTotal, Math.max(filteredIndex, estimated));
}

export async function buildFilteredJobPage(
  fetchBatch: FetchJobBatch | null,
  prefetchedJobs: Job[],
  filterOptions: JobSearchFilterOptions,
  profileContext: ProfileMatchContext,
  activeTargetRoles: string[],
  page: number,
  perPage: number,
  sortBy: "best_match" | "date_posted" = "best_match"
) {
  const catalog: Job[] = [];
  const seenJobIds = new Set<string>();
  let providerTotal = 0;
  let providerPage = 1;
  let scannedAll = false;
  let scannedRaw = 0;
  const neededJobs = page * perPage;
  const maxBatches = Math.min(MAX_ADZUNA_BATCHES, Math.max(2, page + 1));

  const prefetchedFiltered = enrichJobsWithMatchScores(
    prefetchedJobs,
    filterOptions,
    profileContext
  );
  appendUniqueJobs(prefetchedFiltered, catalog, seenJobIds);
  const prefetchedFilteredCount = prefetchedFiltered.length;

  if (!fetchBatch) {
    scannedAll = true;
    scannedRaw = prefetchedJobs.length;
    providerTotal = prefetchedJobs.length;
  }

  while (fetchBatch && providerPage <= maxBatches) {
    const { jobs, total } = await fetchBatch(providerPage, ADZUNA_BATCH_SIZE);
    providerTotal = total;

    if (jobs.length === 0) {
      scannedAll = true;
      break;
    }

    scannedRaw = Math.min(providerPage * ADZUNA_BATCH_SIZE, total);

    const filtered = enrichJobsWithMatchScores(
      jobs,
      filterOptions,
      profileContext
    );

    appendUniqueJobs(filtered, catalog, seenJobIds);

    if (catalog.length >= neededJobs) {
      break;
    }

    if (scannedRaw >= total) {
      scannedAll = true;
      break;
    }

    providerPage += 1;
  }

  const targetStart = (page - 1) * perPage;
  const sortedCatalog =
    sortBy === "date_posted"
      ? sortJobsByDatePosted(catalog)
      : sortJobsByBestMatch(catalog, activeTargetRoles);
  const pageJobs = sortedCatalog.slice(targetStart, targetStart + perPage);
  const paginatedFilteredCount = catalog.length - prefetchedFilteredCount;
  const paginatedEstimate = estimatePaginatedTotal(
    paginatedFilteredCount,
    scannedRaw,
    providerTotal,
    scannedAll
  );
  const totalFiltered = scannedAll
    ? catalog.length
    : prefetchedFilteredCount + paginatedEstimate;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));

  return {
    jobs: pageJobs,
    total: totalFiltered,
    totalPages,
    page,
    perPage,
    providerTotal,
  };
}
