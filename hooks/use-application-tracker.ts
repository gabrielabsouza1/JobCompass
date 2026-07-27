"use client";

import { useState } from "react";

import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { mockJobs } from "@/data/mock-data";
import type { MockApplication } from "@/data/mock-applications";
import type { ApplicationStatus, Job } from "@/types";

import {
    CheckCircle2,
    Clock3,
    FileCheck2,
    MessageCircle,
    XCircle,
} from "lucide-react";

type ApplicationItem = {
    job: Job;
    application: MockApplication;
};

export function useApplicationTracker() {
    const { savedJobIds } = useSavedJobs();
    const { applications, addApplication, resetApplications } = useApplications();

    const [newApplication, setNewApplication] = useState({
        jobId: mockJobs[0]?.id ?? "",
        status: "Applied" as ApplicationStatus,
        nextStep: "",
        notes: "",
    });

    const savedJobs = mockJobs.filter((job) => savedJobIds.includes(job.id));

    const savedApplicationItems: ApplicationItem[] = savedJobs.map((job) => ({
        job,
        application: {
            id: `saved-${job.id}`,
            jobId: job.id,
            status: "Saved",
            nextStep: "Review job and prepare application.",
        },
    }));

    function getApplicationItemsByStatus(
        status: ApplicationStatus
    ): ApplicationItem[] {
        return applications
            .filter((application) => application.status === status)
            .map((application) => {
                const job = mockJobs.find((item) => item.id === application.jobId);

                if (!job) {
                    return null;
                }

                return {
                    job,
                    application,
                };
            })
            .filter((item): item is ApplicationItem => item !== null);
    }

    const applicationColumns = [
        {
            id: "saved",
            title: "Saved",
            icon: Clock3,
            color: "bg-slate-100 text-slate-700",
            items: [...savedApplicationItems, ...getApplicationItemsByStatus("Saved")],
        },
        {
            id: "applied",
            title: "Applied",
            icon: FileCheck2,
            color: "bg-sky-50 text-sky-700",
            items: getApplicationItemsByStatus("Applied"),
        },
        {
            id: "interview",
            title: "Interview",
            icon: MessageCircle,
            color: "bg-purple-50 text-purple-700",
            items: getApplicationItemsByStatus("Interview"),
        },
        {
            id: "offer",
            title: "Offer",
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-700",
            items: getApplicationItemsByStatus("Offer"),
        },
        {
            id: "rejected",
            title: "Rejected",
            icon: XCircle,
            color: "bg-red-50 text-red-700",
            items: getApplicationItemsByStatus("Rejected"),
        },
    ];

    const totalApplications = applicationColumns.reduce(
        (total, column) => total + column.items.length,
        0
    );

    function handleAddApplication() {
        addApplication({
            id: `app-${Date.now()}`,
            jobId: newApplication.jobId,
            status: newApplication.status,
            appliedAt:
                newApplication.status === "Applied" ||
                    newApplication.status === "Interview" ||
                    newApplication.status === "Offer"
                    ? new Date().toISOString().slice(0, 10)
                    : undefined,
            nextStep:
                newApplication.nextStep.trim() || "Review this application later.",
            notes: newApplication.notes.trim() || undefined,
        });

        setNewApplication({
            jobId: mockJobs[0]?.id ?? "",
            status: "Applied",
            nextStep: "",
            notes: "",
        });
    }

    return {
        jobs: mockJobs,
        newApplication,
        setNewApplication,
        applicationColumns,
        totalApplications,
        handleAddApplication,
        resetApplications,
    };
}