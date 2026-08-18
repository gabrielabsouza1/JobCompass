import { extractJobSkills } from "@/lib/jobs/extract-job-skills";
import { DEFAULT_TARGET_ROLES } from "@/lib/profile/target-roles";
import { uniqueSkills } from "@/lib/profile/skills";
import { uniqueTargetRoles } from "@/lib/profile/target-roles";

const RESUME_ROLE_PHRASES = [
  ...DEFAULT_TARGET_ROLES,
  "Software Developer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Developer",
  "Data Analyst",
  "Business Analyst",
  "Project Manager",
  "Product Manager",
  "DevOps Engineer",
  "Cloud Engineer",
  "Systems Administrator",
  "Network Engineer",
  "Cybersecurity Analyst",
  "UX Designer",
  "UI Designer",
  "Scrum Master",
  "Automation Tester",
  "Test Analyst",
  "Quality Assurance",
  "Help Desk",
  "Service Desk",
  "Customer Service",
  "Administrative Assistant",
  "Office Administrator",
  "Accountant",
  "Bookkeeper",
  "Marketing Coordinator",
  "Sales Representative",
];

export type ResumeParseResult = {
  skills: string[];
  targetRoles: string[];
  textLength: number;
  excerpt: string;
};

function normalizeResumeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildResumeExcerpt(text: string, maxLength = 280) {
  const normalized = normalizeResumeText(text);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function extractResumeTargetRoles(text: string, limit = 6) {
  const searchableText = text.toLowerCase();
  const detected: string[] = [];
  const seen = new Set<string>();

  for (const role of RESUME_ROLE_PHRASES) {
    const key = role.toLowerCase();

    if (!searchableText.includes(key) || seen.has(key)) {
      continue;
    }

    seen.add(key);
    detected.push(role);

    if (detected.length >= limit) {
      break;
    }
  }

  return uniqueTargetRoles(detected);
}

export function parseResumeContent(text: string): ResumeParseResult {
  const normalizedText = normalizeResumeText(text);

  return {
    skills: uniqueSkills(extractJobSkills("", normalizedText, 20)),
    targetRoles: extractResumeTargetRoles(normalizedText),
    textLength: normalizedText.length,
    excerpt: buildResumeExcerpt(normalizedText),
  };
}

export function mergeResumeSuggestions(
  currentSkills: string[],
  currentTargetRoles: string[],
  suggestions: Pick<ResumeParseResult, "skills" | "targetRoles">
) {
  return {
    skills: uniqueSkills([...currentSkills, ...suggestions.skills]),
    targetRoles: uniqueTargetRoles([
      ...currentTargetRoles,
      ...suggestions.targetRoles,
    ]),
  };
}
