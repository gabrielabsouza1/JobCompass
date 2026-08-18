type ProfileCompletionInput = {
  countryName?: string;
  cityName?: string;
  workMode?: string;
  employmentType?: string;
  workRights?: string;
  targetRoles?: string[];
  skills?: string[];
};

type CompletionItem = {
  label: string;
  complete: boolean;
  weight: number;
};

export function getProfileCompletionItems(profile: ProfileCompletionInput) {
  const items: CompletionItem[] = [
    {
      label: "Location",
      complete: Boolean(profile.countryName && profile.cityName),
      weight: 20,
    },
    {
      label: "Work mode",
      complete: Boolean(profile.workMode && profile.workMode !== "any"),
      weight: 15,
    },
    {
      label: "Employment type",
      complete: Boolean(profile.employmentType && profile.employmentType !== "any"),
      weight: 10,
    },
    {
      label: "Work rights",
      complete: Boolean(profile.workRights),
      weight: 15,
    },
    {
      label: "Target roles",
      complete: (profile.targetRoles?.length ?? 0) > 0,
      weight: 20,
    },
    {
      label: "Skills",
      complete: (profile.skills?.length ?? 0) >= 3,
      weight: 20,
    },
  ];

  return items;
}

export function calculateProfileCompletion(profile: ProfileCompletionInput) {
  const items = getProfileCompletionItems(profile);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = items
    .filter((item) => item.complete)
    .reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((earnedWeight / totalWeight) * 100);
}
