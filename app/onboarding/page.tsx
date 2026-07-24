import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Set your location",
    description:
      "Choose where you want to work so JobCompass can prioritize relevant Australian jobs.",
    icon: MapPin,
    items: ["Australia", "Victoria", "Melbourne"],
  },
  {
    number: "02",
    title: "Choose target roles",
    description:
      "Tell us which jobs you want so your feed focuses on the right opportunities.",
    icon: BriefcaseBusiness,
    items: ["QA Tester", "IT Support", "Admin Assistant"],
  },
  {
    number: "03",
    title: "Add work rights",
    description:
      "Help JobCompass flag job ads that may need extra review before applying.",
    icon: ShieldCheck,
    items: ["Partner visa", "Full-time work", "Australia"],
  },
  {
    number: "04",
    title: "Select job sources",
    description:
      "Pick up to 5 platforms to combine in-app results with external smart searches.",
    icon: Globe2,
    items: ["Adzuna", "Jooble", "SEEK", "LinkedIn", "Remotive"],
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
            🧭
          </div>

          <span className="text-2xl font-bold tracking-tight text-slate-950">
            Job<span className="text-teal-600">Compass</span>
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          Skip for now
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Quick setup
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950">
            Build your Australian job search profile
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            A few details help JobCompass find better jobs, reduce irrelevant
            results and highlight work rights wording that needs attention.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.number}
                className="rounded-3xl border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Icon className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-teal-700">
                          Step {step.number}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-950">
                          {step.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="leading-7 text-slate-600">
                    {step.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.items.map((item) => (
                      <Badge
                        key={item}
                        className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 rounded-[2rem] border border-teal-100 bg-teal-50 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Your profile is ready
                </h2>

                <p className="mt-1 text-slate-600">
                  Start exploring jobs matched to your location, skills and
                  selected sources.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Finish setup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}