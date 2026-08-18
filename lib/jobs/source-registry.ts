export type SourceIntegration = "in_app" | "smart_link" | "planned";

export type JobSourceMeta = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  category: "API" | "External";
  integration: SourceIntegration;
  recommended: boolean;
  selectable: boolean;
};

export const JOB_SOURCE_REGISTRY: JobSourceMeta[] = [
  {
    id: "adzuna",
    name: "Adzuna",
    description: "Search Australian jobs directly inside JobCompass.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    integration: "in_app",
    recommended: true,
    selectable: true,
  },
  {
    id: "jooble",
    name: "Jooble",
    description: "Aggregated Australian job listings shown inside JobCompass.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    integration: "in_app",
    recommended: true,
    selectable: true,
  },
  {
    id: "remotive",
    name: "Remotive",
    description: "Remote-friendly jobs from global companies, shown inside JobCompass.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    integration: "in_app",
    recommended: true,
    selectable: true,
  },
  {
    id: "seek",
    name: "SEEK",
    description: "Open SEEK with your role and location pre-filled.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    integration: "smart_link",
    recommended: true,
    selectable: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Open LinkedIn Jobs with your search terms pre-filled.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    integration: "smart_link",
    recommended: true,
    selectable: true,
  },
  {
    id: "indeed",
    name: "Indeed AU",
    description: "Open Indeed Australia with your search terms pre-filled.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    integration: "smart_link",
    recommended: false,
    selectable: true,
  },
  {
    id: "jora",
    name: "Jora",
    description: "Open Jora with your role and location pre-filled.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    integration: "smart_link",
    recommended: false,
    selectable: true,
  },
  {
    id: "workforce",
    name: "Workforce Australia",
    description: "Open Workforce Australia job search with your keywords.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    integration: "smart_link",
    recommended: false,
    selectable: true,
  },
];

export const DEFAULT_SELECTED_SOURCE_IDS = [
  "adzuna",
  "jooble",
  "remotive",
  "seek",
  "linkedin",
];

const IN_APP_SOURCE_IDS = new Set(
  JOB_SOURCE_REGISTRY.filter((source) => source.integration === "in_app").map(
    (source) => source.id
  )
);

export function getJobSourceById(sourceId: string) {
  return JOB_SOURCE_REGISTRY.find((source) => source.id === sourceId);
}

export function getSelectedInAppSourceIds(selectedSourceIds: string[]) {
  return selectedSourceIds.filter((sourceId) => IN_APP_SOURCE_IDS.has(sourceId));
}

export function isInAppSourceEnabled(
  selectedSourceIds: string[],
  sourceId: string
) {
  return (
    IN_APP_SOURCE_IDS.has(sourceId) && selectedSourceIds.includes(sourceId)
  );
}

export function getSelectedSmartLinkSources(selectedSourceIds: string[]) {
  return JOB_SOURCE_REGISTRY.filter(
    (source) =>
      source.integration === "smart_link" &&
      selectedSourceIds.includes(source.id)
  );
}

export function jobMatchesSelectedInAppSources(
  jobSource: string,
  selectedSourceIds: string[]
) {
  const inAppSourceIds = getSelectedInAppSourceIds(selectedSourceIds);

  if (inAppSourceIds.length === 0) {
    return false;
  }

  return inAppSourceIds.some((sourceId) =>
    jobSource.toLowerCase().includes(sourceId.toLowerCase())
  );
}

export function hasSelectedInAppSources(selectedSourceIds: string[]) {
  return getSelectedInAppSourceIds(selectedSourceIds).length > 0;
}
