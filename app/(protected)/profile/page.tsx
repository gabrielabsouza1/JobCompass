import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Globe2,
  GraduationCap,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const targetRoles = [
  "QA Tester",
  "Manual Tester",
  "Junior Software Tester",
  "IT Support Officer",
];

const skills = [
  "Manual Testing",
  "Test Cases",
  "Bug Reporting",
  "JIRA",
  "SQL Basics",
  "Agile",
  "Customer Support",
  "Administration",
];

const preferences = [
  {
    label: "Preferred location",
    value: "Melbourne, VIC",
    icon: MapPin,
  },
  {
    label: "Work mode",
    value: "Hybrid or Onsite",
    icon: Globe2,
  },
  {
    label: "Employment type",
    value: "Full-time",
    icon: BriefcaseBusiness,
  },
  {
    label: "Work rights",
    value: "Partner visa · Full-time work allowed",
    icon: ShieldCheck,
  },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Your job search profile
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Profile
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            JobCompass uses this information to match you with better Australian
            jobs and reduce irrelevant results.
          </p>
        </div>

        <Button className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
          <Pencil className="mr-2 h-4 w-4" />
          Edit profile
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-teal-50 via-sky-50 to-white p-6 lg:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                      <UserCircle className="h-12 w-12" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-3xl font-bold text-slate-950">
                          Gabriela Souza
                        </h2>

                        <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                          <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                          Active profile
                        </Badge>
                      </div>

                      <p className="mt-2 text-slate-600">
                        Looking for QA, testing and entry-level tech roles in
                        Australia.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                      Profile completion
                    </p>
                    <p className="mt-1 text-5xl font-bold text-teal-700">
                      82%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4 lg:p-8">
                {preferences.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-200 bg-white p-5"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-1 font-semibold text-slate-950">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Target roles
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Roles JobCompass should prioritize in your job feed.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200"
                >
                  Edit
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {targetRoles.map((role) => (
                  <Badge
                    key={role}
                    className="rounded-full bg-teal-50 px-4 py-2 text-teal-700 hover:bg-teal-50"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Skills
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    These skills help calculate your match score.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200"
                >
                  Add skill
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">
                Resume & documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Later, JobCompass can use your resume to improve job matching.
              </p>

              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700">
                      <FileText className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">
                        Resume not uploaded yet
                      </p>
                      <p className="text-sm text-slate-500">
                        PDF, DOCX or plain text resume support coming soon.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200 bg-white"
                  >
                    Upload resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-bold text-slate-950">Profile checklist</h2>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Location added
                    </p>
                    <p className="text-sm text-slate-500">
                      Melbourne, Victoria
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Target roles selected
                    </p>
                    <p className="text-sm text-slate-500">
                      QA and entry-level tech roles
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Work rights added
                    </p>
                    <p className="text-sm text-slate-500">
                      Used for risk warnings
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Resume upload
                    </p>
                    <p className="text-sm text-slate-500">
                      Improves match accuracy
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-teal-100 bg-teal-50 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700">
                <Sparkles className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Match insight</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                You are getting stronger matches for QA Tester and IT Support
                roles because your profile includes testing, administration and
                customer support skills.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Suggested next skill</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add API Testing or Postman to improve matches for junior QA
                roles.
              </p>

              <Button
                variant="outline"
                className="mt-5 h-11 rounded-2xl border-slate-200 bg-white"
              >
                Add Postman
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </AppShell>
  );
}