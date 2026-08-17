import { searchSkillSuggestions } from "@/data/skill-suggestions";
import { createClient } from "@/lib/supabase/server";

import {
  isMissingSkillCatalogError,
  normalizedSkillName,
  type SkillCatalogEntry,
} from "./skill-catalog";

type CatalogSearchRow = {
  name: string;
  usage_count: number;
  source: string;
};

function mapCatalogRows(rows: CatalogSearchRow[]): SkillCatalogEntry[] {
  return rows.map((row) => ({
    name: row.name,
    usageCount: row.usage_count,
    source: row.source,
  }));
}

export async function searchSkillCatalog(
  query: string,
  limit = 8,
  exclude: string[] = []
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_skill_catalog", {
    search_query: query,
    result_limit: limit + exclude.length,
  });

  if (error) {
    if (isMissingSkillCatalogError(error)) {
      return null;
    }

    throw error;
  }

  const excluded = new Set(exclude.map((skill) => normalizedSkillName(skill)));

  return mapCatalogRows((data as CatalogSearchRow[]) ?? [])
    .filter((entry) => !excluded.has(normalizedSkillName(entry.name)))
    .slice(0, limit);
}

export async function getSkillSuggestions(
  query: string,
  limit = 8,
  exclude: string[] = []
) {
  const catalogResults = await searchSkillCatalog(query, limit, exclude);

  if (catalogResults) {
    return {
      suggestions: catalogResults.map((entry) => entry.name),
      entries: catalogResults,
      source: "catalog" as const,
    };
  }

  const fallbackSuggestions = searchSkillSuggestions(query, limit + exclude.length);
  const excluded = new Set(exclude.map((skill) => normalizedSkillName(skill)));

  const suggestions = fallbackSuggestions
    .filter((skill) => !excluded.has(normalizedSkillName(skill)))
    .slice(0, limit);

  return {
    suggestions,
    entries: suggestions.map((name) => ({
      name,
      usageCount: 0,
      source: "seed",
    })),
    source: "fallback" as const,
  };
}

export async function getNextSkillSuggestion(exclude: string[] = []) {
  const { suggestions } = await getSkillSuggestions("", 1, exclude);

  return suggestions[0] ?? null;
}
