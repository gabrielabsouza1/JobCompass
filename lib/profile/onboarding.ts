import type { ProfileSnapshot } from "@/hooks/use-current-user";

export function hasCompletedOnboarding(profile: ProfileSnapshot) {
  return Boolean(profile.onboardingCompletedAt);
}

export function needsOnboarding(profile: ProfileSnapshot) {
  return !hasCompletedOnboarding(profile);
}
