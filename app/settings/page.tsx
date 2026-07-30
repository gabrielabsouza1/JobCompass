import {
    Bell,
    Database,
    Globe2,
    Lock,
    Mail,
    Palette,
    ShieldCheck,
    UserCircle,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const settingsSections = [
    {
        title: "Account",
        description: "Manage your profile, email and sign-in settings.",
        icon: UserCircle,
        items: ["Name", "Email", "Password"],
    },
    {
        title: "Notifications",
        description: "Choose when JobCompass should notify you.",
        icon: Bell,
        items: ["New job matches", "Application reminders", "Interview follow-ups"],
    },
    {
        title: "Job preferences",
        description: "Control your preferred country, city and work mode.",
        icon: Globe2,
        items: ["Australia", "Melbourne, VIC", "Hybrid or Onsite"],
    },
    {
        title: "Privacy & data",
        description: "Manage stored mock data and future account data.",
        icon: ShieldCheck,
        items: ["Saved jobs", "Applications", "Profile data"],
    },
];

export default function SettingsPage() {
    return (
        <AppShell>
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                        App preferences
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                        Settings
                    </h1>

                    <p className="mt-2 max-w-2xl text-slate-600">
                        Manage your JobCompass account, notifications, preferences and mock
                        data settings.
                    </p>
                </div>

                <Button className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700">
                    Save changes
                </Button>
            </div>

            <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <main className="grid gap-4 md:grid-cols-2">
                    {settingsSections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <Card
                                key={section.title}
                                className="rounded-3xl border-slate-200 bg-white shadow-sm"
                            >
                                <CardContent className="p-6">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-950">
                                        {section.title}
                                    </h2>

                                    <p className="mt-2 leading-7 text-slate-600">
                                        {section.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {section.items.map((item) => (
                                            <Badge
                                                key={item}
                                                className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100"
                                            >
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                    {section.title === "Job preferences" ? (
                                        <Link
                                            href="/sources"
                                            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                                        >
                                            Manage job sources
                                        </Link>
                                    ) : null}
                                </CardContent>
                            </Card>
                        );
                    })}
                </main>

                <aside className="space-y-4">
                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                                <Mail className="h-6 w-6" />
                            </div>

                            <h2 className="font-bold text-slate-950">Email updates</h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Mock setting for weekly job match summaries and application
                                reminders.
                            </p>

                            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                                <span className="text-sm font-semibold text-slate-700">
                                    Weekly summary
                                </span>

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                    On
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                                <Palette className="h-6 w-6" />
                            </div>

                            <h2 className="font-bold text-slate-950">Appearance</h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Theme customization will be added later.
                            </p>

                            <div className="mt-5 grid grid-cols-3 gap-2">
                                <button className="rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700">
                                    Light
                                </button>
                                <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                                    Dark
                                </button>
                                <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                                    System
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-red-100 bg-red-50 shadow-sm">
                        <CardContent className="p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600">
                                <Database className="h-6 w-6" />
                            </div>

                            <h2 className="font-bold text-slate-950">Mock data</h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Later this area can reset saved jobs, applications and profile
                                preferences stored locally.
                            </p>

                            <Button
                                variant="outline"
                                className="mt-5 h-11 rounded-2xl border-red-200 bg-white px-6 text-red-700 hover:bg-red-50"
                            >
                                Reset local data
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-5">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                <Lock className="h-6 w-6" />
                            </div>

                            <h2 className="font-bold text-slate-950">Security</h2>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Password and account security will be connected when real auth
                                is added.
                            </p>
                        </CardContent>
                    </Card>
                </aside>
            </section>
        </AppShell>
    );
}