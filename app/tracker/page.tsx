"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddApplicationModal } from "@/components/tracker/add-application-modal";
import { ApplicationColumn } from "@/components/tracker/application-column";
import { useApplicationTracker } from "@/hooks/use-application-tracker";
import { AppToast } from "@/components/ui/app-toast";

export default function TrackerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const {
    jobs,
    newApplication,
    setNewApplication,
    applicationColumns,
    totalApplications,
    handleAddApplication,
    resetApplications,
  } = useApplicationTracker();

  function showToast(message: string) {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  function handleSaveApplication() {
    handleAddApplication();
    setIsAddModalOpen(false);
    showToast("Application added");
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
            Application pipeline
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Tracker
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Track saved jobs, applications, interviews and offers in one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetApplications?.();
              showToast("Mock data reset");
            }}
            className="h-11 rounded-2xl border-slate-200 bg-white px-6"
          >
            Reset mock data
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700"
          >
            Add application
          </Button>
        </div>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Tracked jobs</p>
              <p className="text-3xl font-bold text-slate-950">
                {totalApplications}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <FileCheck2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Applied</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "applied")
                  ?.items.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Interviews</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "interview")
                  ?.items.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Offers</p>
              <p className="text-3xl font-bold text-slate-950">
                {applicationColumns.find((column) => column.id === "offer")
                  ?.items.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="overflow-x-auto pb-4">
        <div className="grid min-w-275 gap-4 xl:grid-cols-5">
          {applicationColumns.map((column) => (
            <ApplicationColumn key={column.id} column={column} />
          ))}
        </div>
      </section>
      <AddApplicationModal
        isOpen={isAddModalOpen}
        jobs={jobs}
        newApplication={newApplication}
        setNewApplication={setNewApplication}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveApplication}
      />
      <AppToast message={toastMessage} />
    </AppShell>
  );
}