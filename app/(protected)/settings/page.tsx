"use client";

import Link from "next/link";
import {
  Bell,
  Database,
  ExternalLink,
  Globe2,
  Lock,
  Mail,
  MapPin,
  UserCircle,
} from "lucide-react";

import { SmartLinkPanel } from "@/components/jobs/smart-link-panel";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppToast } from "@/components/ui/app-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJobSources } from "@/hooks/use-job-sources";
import { useToast } from "@/hooks/use-toast";
import { getOptionLabel, workModeOptions } from "@/data/profile-options";
import { createClient } from "@/lib/supabase/client";
import {
  getSelectedInAppSourceIds,
  getSelectedSmartLinkSources,
} from "@/lib/jobs/source-registry";

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const { selectedSourceIds } = useJobSources();
  const { toastMessage, showToast } = useToast();

  const locationSummary =
    user?.cityName && user?.stateName && user?.countryName
      ? `${user.cityName}, ${user.stateName}, ${user.countryName}`
      : "Not set";

  const inAppSources = getSelectedInAppSourceIds(selectedSourceIds);
  const smartLinkSources = getSelectedSmartLinkSources(selectedSourceIds);

  async function handleResetTrackerData() {
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      showToast("You need to be logged in");
      return;
    }

    const { error: savedJobsError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", authUser.id);

    if (savedJobsError) {
      console.error(savedJobsError);
      showToast("Could not reset saved jobs");
      return;
    }

    const { error: applicationsError } = await supabase
      .from("applications")
      .delete()
      .eq("user_id", authUser.id);

    if (applicationsError) {
      console.error(applicationsError);
      showToast("Could not reset applications");
      return;
    }

    showToast("Saved jobs and tracker reset");
  }

  async function handlePasswordReset() {
    if (!user?.email) {
      showToast("No email found for this account");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      console.error(error);
      showToast("Could not send password reset email");
      return;
    }

    showToast("Password reset email sent");
  }

  return (
    <AppShell>
      <div className="mb-8">
        <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
          App preferences
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Manage your account, job search preferences, and stored application
          data.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="space-y-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <UserCircle className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-slate-950">Account</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your sign-in details and profile information.
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-950">
                    {user?.fullName || "Not set"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-950">
                    {user?.email || "Not set"}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/profile"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Edit profile
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Globe2 className="h-6 w-6" />
              </div>

              <h2 className="text-xl font-bold text-slate-950">
                Job preferences
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                These values come from your profile and selected job sources.
              </p>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-950">Location</p>
                    <p className="text-slate-600">{locationSummary}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">Work mode</p>
                  <p className="text-slate-600">
                    {user?.workMode
                      ? getOptionLabel(workModeOptions, user.workMode)
                      : "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-2 font-semibold text-slate-950">
                    Active sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inAppSources.map((sourceId) => (
                      <Badge
                        key={sourceId}
                        className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      >
                        {sourceId}
                      </Badge>
                    ))}
                    {smartLinkSources.map((source) => (
                      <Badge
                        key={source.id}
                        className="rounded-full bg-sky-50 text-sky-700 hover:bg-sky-50"
                      >
                        {source.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/sources"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
              >
                Manage job sources
              </Link>
            </CardContent>
          </Card>

          <SmartLinkPanel
            selectedSourceIds={selectedSourceIds}
            profile={{
              targetRoles: user?.targetRoles,
              cityName: user?.cityName,
              stateName: user?.stateName,
              countryName: user?.countryName,
              workMode: user?.workMode,
            }}
          />
        </main>

        <aside className="space-y-4">
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Mail className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Notifications</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Email alerts for matches and application reminders are planned
                for a future release.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-semibold text-slate-700">
                  Weekly summary
                </span>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  Coming soon
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Bell className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Quick links</h2>

              <div className="mt-4 space-y-2">
                <Link
                  href="/jobs"
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  Browse jobs
                  <ExternalLink className="h-4 w-4" />
                </Link>

                <Link
                  href="/tracker"
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  Application tracker
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-red-100 bg-red-50 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-600">
                <Database className="h-6 w-6" />
              </div>

              <h2 className="font-bold text-slate-950">Reset tracker data</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Remove all saved jobs and application tracker entries from your
                account. Your profile is not deleted.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleResetTrackerData();
                }}
                className="mt-5 h-11 rounded-2xl border-red-200 bg-white px-6 text-red-700 hover:bg-red-50"
              >
                Reset saved jobs and tracker
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
                Send a password reset email to your account address.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handlePasswordReset();
                }}
                className="mt-5 h-11 rounded-2xl border-slate-200 bg-white"
              >
                Send password reset email
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
      <AppToast message={toastMessage} />
    </AppShell>
  );
}
