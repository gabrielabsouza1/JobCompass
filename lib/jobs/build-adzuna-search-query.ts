import { uniqueTargetRoles } from "@/lib/profile/target-roles";

export type AdzunaWhatParams = {
  what?: string;
  whatOr?: string;
};

export function buildAdzunaWhatFromQueryAndRoles(
  query: string,
  targetRoles: string[]
): AdzunaWhatParams {
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    return { what: trimmedQuery };
  }

  const roles = uniqueTargetRoles(targetRoles);

  if (roles.length === 0) {
    return {};
  }

  if (roles.length === 1) {
    return { what: roles[0] };
  }

  return { whatOr: roles.join(" ") };
}
