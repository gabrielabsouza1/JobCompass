import type { Job } from "@/types";

const HIGH_RISK_PHRASES = [
  "citizens only",
  "citizen only",
  "australian citizen",
  "australian citizens only",
  "must be an australian citizen",
  "must be a citizen",
  "permanent resident only",
  "pr only",
  "no sponsorship",
  "cannot sponsor",
  "unable to sponsor",
  "will not sponsor",
  "without sponsorship",
];

const MEDIUM_RISK_PHRASES = [
  "pr or citizen",
  "permanent residency",
  "permanent resident",
  "visa sponsorship",
  "sponsorship available",
  "eligible to work in australia",
  "must have full working rights",
  "unrestricted work rights",
  "australian work rights",
  "work rights required",
  "right to work in australia",
  "must be eligible to work",
  "citizenship or pr",
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function detectWorkRightsRisk(
  title: string,
  description: string
): Job["workRightsRisk"] {
  const text = normalizeText(`${title} ${description}`);

  if (HIGH_RISK_PHRASES.some((phrase) => text.includes(phrase))) {
    return "High";
  }

  if (MEDIUM_RISK_PHRASES.some((phrase) => text.includes(phrase))) {
    return "Medium";
  }

  return "Low";
}
