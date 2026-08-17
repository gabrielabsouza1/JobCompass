"use client";

import { useEffect, useId, useState } from "react";

import { normalizeSkill } from "@/lib/profile/skills";

type SkillAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (skill: string) => void;
  existingSkills: string[];
  placeholder?: string;
};

export function SkillAutocompleteInput({
  value,
  onChange,
  onSelect,
  existingSkills,
  placeholder = "e.g. API Testing",
}: SkillAutocompleteInputProps) {
  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const existingSkillKeys = existingSkills
    .map((skill) => skill.toLowerCase())
    .join("|");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const blockedSkills = new Set(
      existingSkillKeys.split("|").filter(Boolean)
    );

    async function loadSuggestions() {
      const response = await fetch(
        `/api/skills/suggest?q=${encodeURIComponent(value)}`,
        { signal: controller.signal }
      );

      if (!response.ok || !isMounted) {
        return;
      }

      const data = (await response.json()) as { suggestions?: string[] };

      setSuggestions(
        (data.suggestions ?? []).filter(
          (skill) => !blockedSkills.has(skill.toLowerCase())
        )
      );
    }

    void loadSuggestions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [value, existingSkillKeys]);

  const normalizedValue = normalizeSkill(value);
  const blockedSkills = new Set(
    existingSkills.map((skill) => skill.toLowerCase())
  );
  const canAddCustom =
    normalizedValue.length > 0 &&
    !blockedSkills.has(normalizedValue.toLowerCase()) &&
    !suggestions.some(
      (skill) => skill.toLowerCase() === normalizedValue.toLowerCase()
    );

  const visibleOptions = canAddCustom
    ? [`Add "${normalizedValue}"`, ...suggestions]
    : suggestions;

  function handleSelect(skill: string) {
    const nextSkill =
      skill.startsWith('Add "') && skill.endsWith('"')
        ? normalizedValue
        : skill;

    onSelect(nextSkill);
    onChange("");
    setIsOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            setIsOpen(true);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              Math.min(current + 1, visibleOptions.length - 1)
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();

            if (activeIndex >= 0 && visibleOptions[activeIndex]) {
              handleSelect(visibleOptions[activeIndex]);
              return;
            }

            if (normalizedValue) {
              handleSelect(normalizedValue);
            }
          }

          if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
      />

      {isOpen && visibleOptions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {visibleOptions.map((skill, index) => (
            <li key={`${skill}-${index}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(skill)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {skill}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
