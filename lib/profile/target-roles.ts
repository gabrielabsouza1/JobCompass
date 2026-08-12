export const DEFAULT_TARGET_ROLES = [
  "QA Tester",
  "Manual Tester",
  "Junior Software Tester",
  "IT Support Officer",
];

export function normalizeTargetRole(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function uniqueTargetRoles(values: string[]) {
  const seen = new Set<string>();

  return values
    .map(normalizeTargetRole)
    .filter((role) => {
      const key = role.toLowerCase();

      if (!role || seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
}

export function parseTargetRolesFromProfile(value: unknown) {
  if (Array.isArray(value)) {
    return uniqueTargetRoles(
      value.filter((item): item is string => typeof item === "string")
    );
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (Array.isArray(parsed)) {
        return uniqueTargetRoles(
          parsed.filter((item): item is string => typeof item === "string")
        );
      }
    } catch {
      return uniqueTargetRoles([value]);
    }
  }

  return [];
}

export function targetRolesFromProfileValue(value?: string[] | null) {
  const parsed = parseTargetRolesFromProfile(value);

  return parsed.length > 0 ? parsed : [...DEFAULT_TARGET_ROLES];
}

export function serializeTargetRolesFilter(roles: string[]) {
  return uniqueTargetRoles(roles).join("|");
}
