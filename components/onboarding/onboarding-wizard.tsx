"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { jobSources } from "@/data/job-sources";
import {
  employmentTypeOptions,
  workModeOptions,
  workRightsOptions,
} from "@/data/profile-options";
import { SkillAutocompleteInput } from "@/components/profile/skill-autocomplete-input";
import { ResumeUploadCard } from "@/components/profile/resume-upload-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJobSources } from "@/hooks/use-job-sources";
import {
  getCities,
  getCountries,
  getStates,
  type CityOption,
  type CountryOption,
  type StateOption,
} from "@/lib/location-api";
import { patchProfile } from "@/lib/profile/patch-profile";
import {
  normalizeSkill,
  uniqueSkills,
} from "@/lib/profile/skills";
import {
  normalizeTargetRole,
  uniqueTargetRoles,
} from "@/lib/profile/target-roles";

const steps = [
  {
    id: "location",
    title: "Set your location",
    description:
      "Choose where you want to work and how you prefer to work.",
    icon: MapPin,
  },
  {
    id: "roles",
    title: "Choose target roles",
    description: "Tell us which jobs you want in your feed.",
    icon: BriefcaseBusiness,
  },
  {
    id: "skills",
    title: "Add your skills",
    description: "Skills help JobCompass rank jobs more accurately.",
    icon: Sparkles,
  },
  {
    id: "rights",
    title: "Add work rights",
    description: "We use this to flag wording that may need extra review.",
    icon: ShieldCheck,
  },
  {
    id: "sources",
    title: "Select job sources",
    description: "Pick up to 5 platforms for your job search.",
    icon: Globe2,
  },
  {
    id: "resume",
    title: "Upload your resume",
    description: "Optional — improves future matching features.",
    icon: FileText,
  },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const { user, applyProfile, refreshUser } = useCurrentUser();
  const { selectedSourceIds, isSourceSelected, toggleSource } = useJobSources();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workRights, setWorkRights] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [newTargetRoleInput, setNewTargetRoleInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setCountryCode(user.countryCode);
    setCountryName(user.countryName);
    setStateCode(user.stateCode);
    setStateName(user.stateName);
    setCityName(user.cityName);
    setWorkMode(user.workMode);
    setEmploymentType(user.employmentType);
    setWorkRights(user.workRights);
    setTargetRoles(user.targetRoles);
    setSkills(user.skills);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadCountries() {
      setIsLoadingLocations(true);

      try {
        const loadedCountries = await getCountries();

        if (isMounted) {
          setCountries(loadedCountries);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!countryCode) {
      return;
    }

    let isMounted = true;

    async function loadStates() {
      setIsLoadingLocations(true);

      try {
        const loadedStates = await getStates(countryCode);

        if (isMounted) {
          setStates(loadedStates);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadStates();

    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode || !stateCode) {
      return;
    }

    let isMounted = true;

    async function loadCities() {
      setIsLoadingLocations(true);

      try {
        const loadedCities = await getCities(countryCode, stateCode);

        if (isMounted) {
          setCities(loadedCities);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadCities();

    return () => {
      isMounted = false;
    };
  }, [countryCode, stateCode]);

  async function handleCountryChange(nextCountryCode: string) {
    const selectedCountry = countries.find(
      (country) => country.iso2 === nextCountryCode
    );

    setCountryCode(nextCountryCode);
    setCountryName(selectedCountry?.name ?? "");
    setStateCode("");
    setStateName("");
    setCityName("");
    setStates([]);
    setCities([]);
  }

  async function handleStateChange(nextStateCode: string) {
    const selectedState = states.find((state) => state.iso2 === nextStateCode);

    setStateCode(nextStateCode);
    setStateName(selectedState?.name ?? "");
    setCityName("");
    setCities([]);
  }

  function handleAddTargetRole() {
    const normalized = normalizeTargetRole(newTargetRoleInput);

    if (!normalized) {
      return;
    }

    setTargetRoles((current) => uniqueTargetRoles([...current, normalized]));
    setNewTargetRoleInput("");
  }

  function handleAddSkill(skill: string) {
    const normalized = normalizeSkill(skill);

    if (!normalized) {
      return;
    }

    setSkills((current) => uniqueSkills([...current, normalized]));
    setNewSkillInput("");
  }

  async function saveCurrentStep() {
    setErrorMessage("");

    if (currentStep === 0) {
      if (!countryCode || !stateCode || !cityName || !workMode || !employmentType) {
        setErrorMessage("Please complete your location and work preferences.");
        return false;
      }

      const profile = await patchProfile({
        countryCode,
        countryName,
        stateCode,
        stateName,
        cityName,
        workMode,
        employmentType,
      });

      if (profile) {
        applyProfile(profile);
      }

      return true;
    }

    if (currentStep === 1) {
      if (targetRoles.length === 0) {
        setErrorMessage("Add at least one target role.");
        return false;
      }

      const profile = await patchProfile({ targetRoles });
      if (profile) {
        applyProfile(profile);
      }

      return true;
    }

    if (currentStep === 2) {
      if (skills.length === 0) {
        setErrorMessage("Add at least one skill.");
        return false;
      }

      const profile = await patchProfile({ skills });
      if (profile) {
        applyProfile(profile);
      }

      return true;
    }

    if (currentStep === 3) {
      if (!workRights) {
        setErrorMessage("Select your work rights.");
        return false;
      }

      const profile = await patchProfile({ workRights });
      if (profile) {
        applyProfile(profile);
      }

      return true;
    }

    if (currentStep === 4) {
      if (selectedSourceIds.length === 0) {
        setErrorMessage("Select at least one job source.");
        return false;
      }

      return true;
    }

    return true;
  }

  async function handleNext() {
    setIsSaving(true);

    try {
      const saved = await saveCurrentStep();

      if (!saved) {
        return;
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep((step) => step + 1);
        return;
      }

      await finishOnboarding();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save this step"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBack() {
    setErrorMessage("");
    setCurrentStep((step) => Math.max(0, step - 1));
  }

  async function finishOnboarding() {
    const completedAt = new Date().toISOString();
    const profile = await patchProfile({ onboardingCompleted: true });

    if (user) {
      applyProfile({
        fullName: profile?.fullName ?? user.fullName,
        email: profile?.email ?? user.email,
        countryCode: profile?.countryCode ?? user.countryCode,
        countryName: profile?.countryName ?? user.countryName,
        stateCode: profile?.stateCode ?? user.stateCode,
        stateName: profile?.stateName ?? user.stateName,
        cityName: profile?.cityName ?? user.cityName,
        workMode: profile?.workMode ?? user.workMode,
        employmentType: profile?.employmentType ?? user.employmentType,
        workRights: profile?.workRights ?? user.workRights,
        targetRoles: profile?.targetRoles ?? user.targetRoles,
        skills: profile?.skills ?? user.skills,
        resumePath: profile?.resumePath ?? user.resumePath,
        resumeFilename: profile?.resumeFilename ?? user.resumeFilename,
        resumeUploadedAt: profile?.resumeUploadedAt ?? user.resumeUploadedAt,
        onboardingCompletedAt: profile?.onboardingCompletedAt ?? completedAt,
      });
    } else {
      refreshUser();
    }

    router.replace("/dashboard");
  }

  async function handleSkip() {
    setIsSaving(true);
    setErrorMessage("");

    try {
      await finishOnboarding();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not skip onboarding"
      );
    } finally {
      setIsSaving(false);
    }
  }

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
            🧭
          </div>

          <span className="text-2xl font-bold tracking-tight text-slate-950">
            Job<span className="text-teal-600">Compass</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => {
            void handleSkip();
          }}
          disabled={isSaving}
          className="text-sm font-semibold text-slate-600 hover:text-teal-700 disabled:opacity-60"
        >
          Skip for now
        </button>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8 text-center">
          <p className="mb-4 inline-flex items-center rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Step {currentStep + 1} of {steps.length}
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Build your Australian job search profile
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            A few details help JobCompass find better jobs and highlight work
            rights wording that needs attention.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {steps.map((item, index) => (
            <div
              key={item.id}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                index < currentStep
                  ? "bg-emerald-100 text-emerald-700"
                  : index === currentStep
                    ? "bg-teal-600 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
          ))}
        </div>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <StepIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {step.title}
                </h2>
                <p className="mt-1 text-slate-600">{step.description}</p>
              </div>
            </div>

            {currentStep === 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Country
                    </label>
                    <select
                      value={countryCode}
                      onChange={(event) => {
                        void handleCountryChange(event.target.value);
                      }}
                      required
                      disabled={isLoadingLocations}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    >
                      <option value="" disabled>
                        Select country
                      </option>
                      {countries.map((country) => (
                        <option key={country.iso2} value={country.iso2}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      State
                    </label>
                    <select
                      value={stateCode}
                      onChange={(event) => {
                        void handleStateChange(event.target.value);
                      }}
                      required
                      disabled={!countryCode || isLoadingLocations}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50 disabled:bg-slate-50"
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {states.map((state) => (
                        <option key={state.iso2} value={state.iso2}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      City
                    </label>
                    <select
                      value={cityName}
                      onChange={(event) => setCityName(event.target.value)}
                      required
                      disabled={!stateCode || isLoadingLocations}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50 disabled:bg-slate-50"
                    >
                      <option value="" disabled>
                        Select city
                      </option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Work mode
                    </label>
                    <select
                      value={workMode}
                      onChange={(event) => setWorkMode(event.target.value)}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    >
                      <option value="" disabled>
                        Select work mode
                      </option>
                      {workModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Employment type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(event) => setEmploymentType(event.target.value)}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    >
                      <option value="" disabled>
                        Select employment type
                      </option>
                      {employmentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={newTargetRoleInput}
                    onChange={(event) => setNewTargetRoleInput(event.target.value)}
                    placeholder="e.g. QA Tester"
                    className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddTargetRole();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTargetRole}
                    className="h-12 rounded-2xl bg-teal-600 px-5 hover:bg-teal-700"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {targetRoles.map((role) => (
                    <Badge
                      key={role}
                      className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() =>
                          setTargetRoles((current) =>
                            current.filter((item) => item !== role)
                          )
                        }
                        className="ml-2 text-slate-400 hover:text-slate-700"
                        aria-label={`Remove ${role}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-4">
                <SkillAutocompleteInput
                  value={newSkillInput}
                  onChange={setNewSkillInput}
                  onSelect={handleAddSkill}
                  existingSkills={skills}
                  placeholder="e.g. API Testing"
                />

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setSkills((current) =>
                            current.filter((item) => item !== skill)
                          )
                        }
                        className="ml-2 text-slate-400 hover:text-slate-700"
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Work rights
                </label>
                <select
                  value={workRights}
                  onChange={(event) => setWorkRights(event.target.value)}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                >
                  <option value="" disabled>
                    Select work rights
                  </option>
                  {workRightsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {jobSources.map((source) => {
                  const selected = isSourceSelected(source.id);
                  const atLimit = selectedSourceIds.length >= 5 && !selected;

                  return (
                    <button
                      key={source.id}
                      type="button"
                      disabled={atLimit}
                      onClick={() => {
                        void toggleSource(source.id);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-teal-300 bg-teal-50"
                          : "border-slate-200 bg-white hover:border-teal-200"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {source.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {source.description}
                          </p>
                        </div>
                        {selected ? (
                          <Check className="h-5 w-5 shrink-0 text-teal-700" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {currentStep === 5 ? (
              <ResumeUploadCard
                resumeFilename={user?.resumeFilename}
                resumeUploadedAt={user?.resumeUploadedAt}
                onUploaded={(payload) => {
                  if (!user) {
                    return;
                  }

                  applyProfile({
                    ...user,
                    resumePath: payload.resumePath,
                    resumeFilename: payload.resumeFilename,
                    resumeUploadedAt: payload.resumeUploadedAt,
                  });
                }}
                onRemoved={() => {
                  if (!user) {
                    return;
                  }

                  applyProfile({
                    ...user,
                    resumePath: "",
                    resumeFilename: "",
                    resumeUploadedAt: null,
                  });
                }}
                onError={setErrorMessage}
              />
            ) : null}

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleBack();
                }}
                disabled={currentStep === 0 || isSaving}
                className="h-11 rounded-2xl border-slate-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                type="button"
                onClick={() => {
                  void handleNext();
                }}
                disabled={isSaving}
                className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700"
              >
                {currentStep === steps.length - 1 ? "Finish setup" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
