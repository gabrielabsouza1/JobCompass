import { expandSkillTerms } from "@/data/skill-aliases";
import { normalizedSkillName } from "@/lib/skills/skill-catalog";

export type SkillMatchDetails = {
  matchedSkills: string[];
  missingSkills: string[];
  skillsScore: number;
};

type JobSkillMatchInput = {
  title: string;
  description: string;
  skills: string[];
};

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function skillMatchesText(skill: string, searchableText: string) {
  const terms = expandSkillTerms(skill);

  return terms.some((term) => {
    if (term.length <= 2) {
      return false;
    }

    if (searchableText.includes(term)) {
      return true;
    }

    return term.split(/\s+/).some(
      (word) => word.length > 2 && searchableText.includes(word)
    );
  });
}

export function getProfileSkillMatch(
  profileSkills: string[],
  job: JobSkillMatchInput
): SkillMatchDetails {
  const uniqueProfileSkills = profileSkills.filter(Boolean);
  const searchableText = normalizeSearchText(
    `${job.title} ${job.description} ${job.skills.join(" ")}`
  );

  if (uniqueProfileSkills.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      skillsScore: 0,
    };
  }

  const matchedSkills = uniqueProfileSkills.filter((skill) =>
    skillMatchesText(skill, searchableText)
  );
  const matchedKeys = new Set(
    matchedSkills.map((skill) => normalizedSkillName(skill))
  );
  const missingSkills = uniqueProfileSkills.filter(
    (skill) => !matchedKeys.has(normalizedSkillName(skill))
  );

  return {
    matchedSkills,
    missingSkills,
    skillsScore: Math.min(matchedSkills.length * 4, 20),
  };
}
