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

type FetchAdzunaBatch = (
  page: number,
  perPage: number
) => Promise<{ jobs: Job[]; total: number }>;

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

function estimateFilteredTotal(
  filteredIndex: number,
  scannedRaw: number,
  adzunaTotal: number,
  scannedAll: boolean
) {
  if (scannedAll) {
    return filteredIndex;
  }

  if (scannedRaw <= 0 || filteredIndex <= 0) {
    return adzunaTotal;
  }

  const estimated = Math.round((filteredIndex / scannedRaw) * adzunaTotal);

  return Math.min(adzunaTotal, Math.max(filteredIndex, estimated));
}

export async function buildFilteredJobPage(
  fetchBatch: FetchAdzunaBatch,
  filterOptions: JobSearchFilterOptions,
  profileContext: ProfileMatchContext,
  activeTargetRoles: string[],
  page: number,
  perPage: number,
  sortBy: "best_match" | "date_posted" = "best_match"
) {
  const catalog: Job[] = [];
  const seenJobIds = new Set<string>();
  let adzunaTotal = 0;
  let adzunaPage = 1;
  let scannedAll = false;
  let scannedRaw = 0;
  const neededJobs = page * perPage;
  const maxBatches = Math.min(MAX_ADZUNA_BATCHES, Math.max(2, page + 1));

  while (adzunaPage <= maxBatches) {
    const { jobs, total } = await fetchBatch(adzunaPage, ADZUNA_BATCH_SIZE);
    adzunaTotal = total;

    if (jobs.length === 0) {
      scannedAll = true;
      break;
    }

    scannedRaw = Math.min(adzunaPage * ADZUNA_BATCH_SIZE, total);

    const filtered = jobs
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

    for (const job of filtered) {
      if (seenJobIds.has(job.id)) {
        continue;
      }

      seenJobIds.add(job.id);
      catalog.push(job);
    }

    if (catalog.length >= neededJobs) {
      break;
    }

    if (scannedRaw >= total) {
      scannedAll = true;
      break;
    }

    adzunaPage += 1;
  }

  const targetStart = (page - 1) * perPage;
  const sortedCatalog =
    sortBy === "date_posted"
      ? sortJobsByDatePosted(catalog)
      : sortJobsByBestMatch(catalog, activeTargetRoles);
  const pageJobs = sortedCatalog.slice(targetStart, targetStart + perPage);
  const totalFiltered = estimateFilteredTotal(
    catalog.length,
    scannedRaw,
    adzunaTotal,
    scannedAll
  );
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));

  return {
    jobs: pageJobs,
    total: totalFiltered,
    totalPages,
    page,
    perPage,
    adzunaTotal,
  };
}
