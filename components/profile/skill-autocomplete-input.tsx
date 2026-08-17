"use client";

import { useEffect, useId, useState } from "react";

import { normalizeSkill } from "@/lib/profile/skills";

type EscoSuggestion = {
  name: string;
  uri: string;
  type: string | null;
};

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
  const [escoSuggestions, setEscoSuggestions] = useState<EscoSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isRegisteringEsco, setIsRegisteringEsco] = useState(false);

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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const blockedSkills = new Set(
      existingSkillKeys.split("|").filter(Boolean)
    );

    async function loadEscoSuggestions() {
      if (value.trim().length < 3) {
        setEscoSuggestions([]);
        return;
      }

      const response = await fetch(
        `/api/skills/esco-search?q=${encodeURIComponent(value)}`,
        { signal: controller.signal }
      );

      if (!response.ok || !isMounted) {
        return;
      }

      const data = (await response.json()) as { results?: EscoSuggestion[] };

      setEscoSuggestions(
        (data.results ?? []).filter(
          (result) => !blockedSkills.has(result.name.toLowerCase())
        )
      );
    }

    void loadEscoSuggestions();

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
    ) &&
    !escoSuggestions.some(
      (skill) => skill.name.toLowerCase() === normalizedValue.toLowerCase()
    );

  const catalogOptions = canAddCustom
    ? [`Add "${normalizedValue}"`, ...suggestions]
    : suggestions;

  const visibleOptions = [
    ...catalogOptions.map((option) => ({
      kind: "catalog" as const,
      label: option,
      esco: null as EscoSuggestion | null,
    })),
    ...escoSuggestions.map((option) => ({
      kind: "esco" as const,
      label: option.name,
      esco: option,
    })),
  ];

  async function handleSelect(option: (typeof visibleOptions)[number]) {
    if (
      option.kind === "catalog" &&
      option.label.startsWith('Add "') &&
      option.label.endsWith('"')
    ) {
      onSelect(normalizedValue);
      onChange("");
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (option.kind === "esco" && option.esco) {
      setIsRegisteringEsco(true);

      try {
        const response = await fetch("/api/skills/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: option.esco.name,
            escoUri: option.esco.uri,
            escoType: option.esco.type,
          }),
        });

        const data = (await response.json()) as { name?: string; error?: string };

        if (!response.ok || !data.name) {
          throw new Error(data.error ?? "Could not register ESCO skill");
        }

        onSelect(data.name);
        onChange("");
        setIsOpen(false);
        setActiveIndex(-1);
      } catch (error) {
        console.error(error);
        onSelect(option.esco.name);
        onChange("");
        setIsOpen(false);
        setActiveIndex(-1);
      } finally {
        setIsRegisteringEsco(false);
      }

      return;
    }

    onSelect(option.label);
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
              void handleSelect(visibleOptions[activeIndex]);
              return;
            }

            if (normalizedValue) {
              void handleSelect({
                kind: "catalog",
                label: normalizedValue,
                esco: null,
              });
            }
          }

          if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={placeholder}
        disabled={isRegisteringEsco}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      {isOpen && visibleOptions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          {visibleOptions.map((option, index) => {
            const showEscoHeading =
              option.kind === "esco" &&
              (index === 0 || visibleOptions[index - 1]?.kind !== "esco");

            return (
              <li key={`${option.kind}-${option.label}-${index}`}>
                {showEscoHeading ? (
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    From ESCO
                  </p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    void handleSelect(option);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {option.kind === "esco" ? (
                    <span className="ml-2 text-xs font-medium text-slate-400">
                      ESCO
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
