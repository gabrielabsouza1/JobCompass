import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Australia-focused",
    description:
      "Search jobs with local context, states, cities and Australian platforms in mind.",
    icon: MapPin,
  },
  {
    title: "Smart job sources",
    description:
      "Combine in-app job APIs with smart links to major job boards like SEEK and LinkedIn.",
    icon: Globe2,
  },
  {
    title: "Work rights awareness",
    description:
      "Spot job ads that may require extra attention based on work rights wording.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
            🧭
          </div>

          <span className="text-2xl font-bold tracking-tight text-slate-950">
            Job<span className="text-teal-600">Compass</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/jobs" className="hover:text-teal-700">
            Jobs
          </Link>
          <Link href="/sources" className="hover:text-teal-700">
            Sources
          </Link>
          <Link href="/tracker" className="hover:text-teal-700">
            Tracker
          </Link>
          <Link href="/profile" className="hover:text-teal-700">
            Profile
          </Link>
        </nav>

        <Link
          href="/onboarding"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Get Started
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_520px] lg:items-center lg:py-20">
        <div>
          <p className="mb-4 inline-flex items-center rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Built for job seekers in Australia
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-950 lg:text-7xl">
            Find the right job faster with{" "}
            <span className="text-teal-600">local context.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            JobCompass helps newcomers and international workers search across
            Australian job platforms, compare opportunities and track
            applications in one simple workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/jobs"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              View jobs
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              No scraping-first approach
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Australia MVP
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Built for real job search workflows
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-50 to-teal-50 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Today&apos;s match
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  QA Tester
                </h2>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500">Match</p>
                <p className="text-2xl font-bold text-teal-700">87%</p>
              </div>
            </div>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>

                <h3 className="font-bold text-slate-950">
                  TechNova Solutions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Melbourne, VIC · Hybrid · Full-time
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Manual Testing
                  </span>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    JIRA
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    SQL
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <Sparkles className="h-6 w-6 text-teal-700" />
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  Better matches
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Based on your profile.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-emerald-700" />
                <p className="mt-3 text-sm font-semibold text-slate-950">
                  Work rights note
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Review risky wording.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-16 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card
              key={feature.title}
              className="rounded-3xl border-slate-200 bg-white shadow-sm"
            >
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon className="h-6 w-6" />
                </div>

                <h2 className="text-xl font-bold text-slate-950">
                  {feature.title}
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}