"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResumeParseResult } from "@/lib/resume/parse-resume-content";

type ResumeParseSuggestionsProps = {
  parseResult: ResumeParseResult;
  currentSkills: string[];
  currentTargetRoles: string[];
  isApplying?: boolean;
  onApply: (payload: { skills: string[]; targetRoles: string[] }) => void;
  onDismiss?: () => void;
};

function getNewSuggestions(current: string[], suggested: string[]) {
  const existing = new Set(current.map((value) => value.toLowerCase()));

  return suggested.filter((value) => !existing.has(value.toLowerCase()));
}

export function ResumeParseSuggestions({
  parseResult,
  currentSkills,
  currentTargetRoles,
  isApplying = false,
  onApply,
  onDismiss,
}: ResumeParseSuggestionsProps) {
  const [selectedSkills, setSelectedSkills] = useState(
    () => new Set(getNewSuggestions(currentSkills, parseResult.skills))
  );
  const [selectedRoles, setSelectedRoles] = useState(
    () => new Set(getNewSuggestions(currentTargetRoles, parseResult.targetRoles))
  );

  const newSkillSuggestions = getNewSuggestions(currentSkills, parseResult.skills);
  const newRoleSuggestions = getNewSuggestions(
    currentTargetRoles,
    parseResult.targetRoles
  );
  const hasSuggestions =
    newSkillSuggestions.length > 0 || newRoleSuggestions.length > 0;
  const selectedCount = selectedSkills.size + selectedRoles.size;

  function toggleSkill(skill: string) {
    setSelectedSkills((current) => {
      const next = new Set(current);

      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }

      return next;
    });
  }

  function toggleRole(role: string) {
    setSelectedRoles((current) => {
      const next = new Set(current);

      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }

      return next;
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              Suggestions from your resume
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {hasSuggestions
                ? "Review and add skills or target roles to your profile."
                : "We read your resume, but everything suggested is already on your profile."}
            </p>
          </div>
        </div>

        {onDismiss ? (
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-700"
            onClick={onDismiss}
            aria-label="Dismiss suggestions"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {parseResult.excerpt ? (
        <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-600">
          {parseResult.excerpt}
        </p>
      ) : null}

      {newSkillSuggestions.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-800">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {newSkillSuggestions.map((skill) => {
              const selected = selectedSkills.has(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="rounded-full"
                >
                  <Badge
                    className={
                      selected
                        ? "bg-teal-700 text-white hover:bg-teal-700"
                        : "bg-white text-slate-700 hover:bg-white"
                    }
                  >
                    {selected ? <Check className="mr-1 h-3 w-3" /> : null}
                    {skill}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {newRoleSuggestions.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-800">Target roles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {newRoleSuggestions.map((role) => {
              const selected = selectedRoles.has(role);

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className="rounded-full"
                >
                  <Badge
                    className={
                      selected
                        ? "bg-teal-700 text-white hover:bg-teal-700"
                        : "bg-white text-slate-700 hover:bg-white"
                    }
                  >
                    {selected ? <Check className="mr-1 h-3 w-3" /> : null}
                    {role}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {hasSuggestions ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-10 rounded-2xl bg-teal-700 text-white hover:bg-teal-800"
            disabled={isApplying || selectedCount === 0}
            onClick={() =>
              onApply({
                skills: [...currentSkills, ...selectedSkills],
                targetRoles: [...currentTargetRoles, ...selectedRoles],
              })
            }
          >
            {isApplying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Add {selectedCount} to profile
          </Button>
        </div>
      ) : null}
    </div>
  );
}
