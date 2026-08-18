export const SKILL_SUGGESTIONS = [
  "Manual Testing",
  "Test Cases",
  "Bug Reporting",
  "JIRA",
  "SQL Basics",
  "Agile",
  "Customer Support",
  "Administration",
  "API Testing",
  "Postman",
  "Selenium",
  "Cypress",
  "Playwright",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "React",
  "Node.js",
  "HTML",
  "CSS",
  "Git",
  "CI/CD",
  "Docker",
  "AWS",
  "Azure",
  "Linux",
  "Networking",
  "Help Desk",
  "IT Support",
  "Active Directory",
  "Microsoft Office",
  "Excel",
  "Data Entry",
  "Communication",
  "Problem Solving",
  "Attention to Detail",
  "Regression Testing",
  "Smoke Testing",
  "UAT",
  "Test Automation",
  "REST APIs",
  "JSON",
  "Scrum",
  "Kanban",
  "Technical Writing",
  "Stakeholder Management",
  "Incident Management",
  "Service Desk",
  "Troubleshooting",
  "Quality Assurance",
  "Software Testing",
  "Mobile Testing",
  "Accessibility Testing",
  "Performance Testing",
];

export function searchSkillSuggestions(query: string, limit = 8) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return SKILL_SUGGESTIONS.slice(0, limit);
  }

  return SKILL_SUGGESTIONS.filter((skill) =>
    skill.toLowerCase().includes(normalizedQuery)
  ).slice(0, limit);
}

export function suggestNextSkill(existingSkills: string[]) {
  const existing = new Set(existingSkills.map((skill) => skill.toLowerCase()));

  const nextSuggestion = SKILL_SUGGESTIONS.find(
    (skill) => !existing.has(skill.toLowerCase())
  );

  return nextSuggestion ?? null;
}
