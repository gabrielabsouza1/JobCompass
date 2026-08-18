export function normalizeSkill(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function uniqueSkills(values: string[]) {
  const seen = new Set<string>();

  return values
    .map(normalizeSkill)
    .filter((skill) => {
      const key = skill.toLowerCase();

      if (!skill || seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

export function parseSkillsFromProfile(value: unknown) {
  if (Array.isArray(value)) {
    return uniqueSkills(
      value.filter((item): item is string => typeof item === "string")
    );
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (Array.isArray(parsed)) {
        return uniqueSkills(
          parsed.filter((item): item is string => typeof item === "string")
        );
      }
    } catch {
      return uniqueSkills([value]);
    }
  }

  return [];
}

export function serializeSkillsFilter(skills: string[]) {
  return uniqueSkills(skills).join("|");
}
