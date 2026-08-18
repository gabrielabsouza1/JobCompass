export const SKILL_ALIAS_GROUPS: string[][] = [
  ["JavaScript", "JS"],
  ["TypeScript", "TS"],
  ["SQL Basics", "SQL"],
  ["JIRA", "Atlassian Jira"],
  ["CI/CD", "Continuous Integration"],
  ["REST APIs", "REST API"],
  ["API Testing", "API test"],
  ["Manual Testing", "Manual QA"],
  ["Test Automation", "Automated Testing"],
  ["IT Support", "Technical Support", "Help Desk"],
  ["Quality Assurance", "QA"],
  ["Software Testing", "Software QA"],
  ["Microsoft Office", "MS Office"],
  ["Problem Solving", "Analytical Thinking"],
  ["Node.js", "NodeJS"],
  ["C#", "C Sharp"],
];

function normalizeAliasTerm(value: string) {
  return value.toLowerCase().trim();
}

const aliasLookup = new Map<string, Set<string>>();

for (const group of SKILL_ALIAS_GROUPS) {
  const normalizedGroup = group.map(normalizeAliasTerm);

  for (const term of normalizedGroup) {
    const existing = aliasLookup.get(term) ?? new Set<string>();
    normalizedGroup.forEach((item) => existing.add(item));
    aliasLookup.set(term, existing);
  }
}

export function expandSkillTerms(skill: string) {
  const normalized = normalizeAliasTerm(skill);
  const terms = aliasLookup.get(normalized) ?? new Set([normalized]);

  return [...terms];
}
