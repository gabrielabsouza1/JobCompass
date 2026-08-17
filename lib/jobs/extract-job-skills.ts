import { SKILL_SUGGESTIONS } from "@/data/skill-suggestions";
import { expandSkillTerms } from "@/data/skill-aliases";
import { normalizedSkillName } from "@/lib/skills/skill-catalog";

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function extractJobSkills(
  title: string,
  description: string,
  limit = 8
) {
  const searchableText = normalizeSearchText(`${title} ${description}`);
  const detected: string[] = [];
  const seen = new Set<string>();

  for (const skill of SKILL_SUGGESTIONS) {
    const terms = expandSkillTerms(skill);
    const matches = terms.some((term) => {
      if (term.length <= 2) {
        return false;
      }

      return searchableText.includes(term);
    });

    if (!matches) {
      continue;
    }

    const key = normalizedSkillName(skill);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    detected.push(skill);

    if (detected.length >= limit) {
      break;
    }
  }

  return detected;
}
