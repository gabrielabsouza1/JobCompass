export type JobSourceDefinition = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  category: "API" | "External";
  recommended: boolean;
};

export const jobSources: JobSourceDefinition[] = [
  {
    id: "adzuna",
    name: "Adzuna",
    description: "Search Australian jobs directly inside JobCompass.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    recommended: true,
  },
  {
    id: "jooble",
    name: "Jooble",
    description: "Aggregated job listings from multiple sources.",
    type: "In-app results",
    status: "Connected",
    category: "API",
    recommended: true,
  },
  {
    id: "remotive",
    name: "Remotive",
    description: "Remote-friendly jobs from global companies.",
    type: "In-app results",
    status: "Available",
    category: "API",
    recommended: false,
  },
  {
    id: "seek",
    name: "SEEK",
    description: "One of Australia's most popular job platforms.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    recommended: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Useful for corporate, tech and professional roles.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    recommended: true,
  },
  {
    id: "indeed",
    name: "Indeed AU",
    description: "Large job search engine with broad role coverage.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    recommended: false,
  },
  {
    id: "jora",
    name: "Jora",
    description: "Australian job search platform with local listings.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    recommended: false,
  },
  {
    id: "workforce",
    name: "Workforce Australia",
    description: "Government-backed Australian employment platform.",
    type: "External smart search",
    status: "Smart link",
    category: "External",
    recommended: false,
  },
];
