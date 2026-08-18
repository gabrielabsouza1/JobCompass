import { normalizeSkill } from "@/lib/profile/skills";

export function normalizedSkillName(value: string) {
  return normalizeSkill(value).toLowerCase();
}

export type SkillCatalogEntry = {
  name: string;
  usageCount: number;
  source: string;
};

export function isMissingSkillCatalogError(error: {
  message?: string;
  details?: string;
  code?: string;
}) {
  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

  return (
    message.includes("skill_catalog") ||
    message.includes("search_skill_catalog") ||
    message.includes("record_skill_usage") ||
    message.includes("upsert_esco_skill")
  );
}
