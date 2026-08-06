import type { Job } from "@/types";

type UserMatchProfile = {
  cityName?: string;
  stateName?: string;
  countryName?: string;
  workMode?: string;
  employmentType?: string;
  workRights?: string;
};

function normalizeText(value?: string) {
  return value?.toLowerCase().trim() ?? "";
}

function normalizeWorkMode(value?: string) {
  const normalized = normalizeText(value);

  if (normalized === "remote") return "remote";
  if (normalized === "hybrid") return "hybrid";
  if (normalized === "onsite" || normalized === "on-site") return "onsite";

  return normalized;
}

function normalizeEmploymentType(value?: string) {
  const normalized = normalizeText(value);

  if (normalized.includes("full")) return "full_time";
  if (normalized.includes("part")) return "part_time";
  if (normalized.includes("casual")) return "casual";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("intern")) return "internship";

  return normalized;
}

function calculateLocationScore(job: Job, profile: UserMatchProfile) {
  const jobLocation = normalizeText(job.location);
  const userCity = normalizeText(profile.cityName);
  const userState = normalizeText(profile.stateName);
  const userCountry = normalizeText(profile.countryName);

  if (!userCity && !userState && !userCountry) {
    return 0;
  }

  if (userCity && jobLocation.includes(userCity)) {
    return 25;
  }

  if (userState && jobLocation.includes(userState)) {
    return 15;
  }

  if (userCountry && jobLocation.includes(userCountry)) {
    return 8;
  }

  return 0;
}

function calculateWorkModeScore(job: Job, profile: UserMatchProfile) {
  const userWorkMode = normalizeWorkMode(profile.workMode);
  const jobWorkMode = normalizeWorkMode(job.workMode);

  if (!userWorkMode || userWorkMode === "any") {
    return 8;
  }

  if (userWorkMode === jobWorkMode) {
    return 20;
  }

  if (userWorkMode === "remote" && jobWorkMode === "hybrid") {
    return 10;
  }

  if (userWorkMode === "hybrid" && jobWorkMode === "remote") {
    return 10;
  }

  return 0;
}

function calculateEmploymentScore(job: Job, profile: UserMatchProfile) {
  const userEmploymentType = normalizeEmploymentType(profile.employmentType);
  const jobEmploymentType = normalizeEmploymentType(job.employmentType);

  if (!userEmploymentType || userEmploymentType === "any") {
    return 8;
  }

  if (userEmploymentType === jobEmploymentType) {
    return 15;
  }

  return 0;
}

function calculateSkillsScore(job: Job) {
  const priorityKeywords = [
    "qa",
    "tester",
    "testing",
    "software",
    "support",
    "administration",
    "customer",
    "sql",
    "jira",
  ];

  const searchableText = normalizeText(
    `${job.title} ${job.description} ${job.skills.join(" ")}`
  );

  const matchedKeywords = priorityKeywords.filter((keyword) =>
    searchableText.includes(keyword)
  );

  return Math.min(matchedKeywords.length * 4, 20);
}

function calculateWorkRightsScore(job: Job, profile: UserMatchProfile) {
  const workRights = normalizeText(profile.workRights);

  if (!workRights) {
    return 0;
  }

  if (job.workRightsRisk === "Low") {
    return 10;
  }

  if (
    job.workRightsRisk === "Medium" &&
    (workRights === "full_time_allowed" || workRights === "citizen_or_pr")
  ) {
    return 5;
  }

  if (job.workRightsRisk === "High") {
    return -10;
  }

  return 0;
}

export function calculateMatchScore(job: Job, profile: UserMatchProfile) {
  const locationScore = calculateLocationScore(job, profile);
  const workModeScore = calculateWorkModeScore(job, profile);
  const employmentScore = calculateEmploymentScore(job, profile);
  const skillsScore = calculateSkillsScore(job);
  const workRightsScore = calculateWorkRightsScore(job, profile);

  const totalScore =
    30 +
    locationScore +
    workModeScore +
    employmentScore +
    skillsScore +
    workRightsScore;

  return Math.max(0, Math.min(totalScore, 100));
}