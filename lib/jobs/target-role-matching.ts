import type { Job } from "@/types";

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[-_/]/g, " ");
}

export function getRoleKeywords(role: string) {
  return normalizeSearchText(role)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1);
}

export function getJobSearchableText(job: Job) {
  return normalizeSearchText(
    `${job.title} ${job.company} ${job.description} ${job.skills.join(" ")}`
  );
}

export type TargetRoleMatch = {
  role: string | null;
  matchedKeywordCount: number;
  totalKeywords: number;
};

export function getBestTargetRoleMatch(
  job: Job,
  activeRoles: string[]
): TargetRoleMatch {
  if (activeRoles.length === 0) {
    return {
      role: null,
      matchedKeywordCount: 0,
      totalKeywords: 0,
    };
  }

  const searchableText = getJobSearchableText(job);
  let bestMatch: TargetRoleMatch = {
    role: null,
    matchedKeywordCount: 0,
    totalKeywords: 0,
  };

  for (const role of activeRoles) {
    const keywords = getRoleKeywords(role);

    if (keywords.length === 0) {
      continue;
    }

    const matchedKeywordCount = keywords.filter((keyword) =>
      searchableText.includes(keyword)
    ).length;

    if (matchedKeywordCount > bestMatch.matchedKeywordCount) {
      bestMatch = {
        role,
        matchedKeywordCount,
        totalKeywords: keywords.length,
      };
    }
  }

  return bestMatch;
}

export function compareJobsByTargetRoles(
  left: Job,
  right: Job,
  activeRoles: string[]
) {
  if (activeRoles.length === 0) {
    return 0;
  }

  const leftMatch = getBestTargetRoleMatch(left, activeRoles);
  const rightMatch = getBestTargetRoleMatch(right, activeRoles);

  if (rightMatch.matchedKeywordCount !== leftMatch.matchedKeywordCount) {
    return rightMatch.matchedKeywordCount - leftMatch.matchedKeywordCount;
  }

  const leftRatio =
    leftMatch.totalKeywords > 0
      ? leftMatch.matchedKeywordCount / leftMatch.totalKeywords
      : 0;
  const rightRatio =
    rightMatch.totalKeywords > 0
      ? rightMatch.matchedKeywordCount / rightMatch.totalKeywords
      : 0;

  if (rightRatio !== leftRatio) {
    return rightRatio > leftRatio ? 1 : -1;
  }

  return 0;
}
