import { createClient } from "@/lib/supabase/server";

import { isMissingSkillCatalogError } from "./skill-catalog";

export async function recordSkillUsage(skillNames: string[]) {
  if (skillNames.length === 0) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_skill_usage", {
    skill_names: skillNames,
  });

  if (error && !isMissingSkillCatalogError(error)) {
    console.error("Could not record skill usage", error);
  }
}

export async function upsertEscoSkill(
  name: string,
  escoUri: string,
  escoType?: string | null
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("upsert_esco_skill", {
    p_name: name,
    p_esco_uri: escoUri,
    p_esco_type: escoType ?? null,
  });

  if (error) {
    throw error;
  }

  return typeof data === "string" ? data : name;
}
