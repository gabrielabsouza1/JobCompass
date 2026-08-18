import type { LucideIcon } from "lucide-react";

import type { ApplicationStatus, Job } from "@/types";
import type { Application } from "@/types/application";
import { ApplicationCard } from "@/components/tracker/application-card";

type ApplicationItem = {
  job: Job;
  application: Application;
};

type ApplicationColumnProps = {
  column: {
    id: string;
    title: string;
    icon: LucideIcon;
    color: string;
    items: ApplicationItem[];
  };
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void;
};

export function ApplicationColumn({
  column,
  onStatusChange,
}: ApplicationColumnProps) {
  const Icon = column.icon;

  return (
    <div className="rounded-3xl bg-slate-100 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${column.color}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">{column.title}</h2>
            <p className="text-sm text-slate-500">
              {column.items.length} jobs
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {column.items.length > 0 ? (
          column.items.map(({ job, application }, index) => (
            <ApplicationCard
              key={`${column.id}-${application.id}-${index}`}
              job={job}
              application={application}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-center">
            <p className="text-sm font-medium text-slate-500">No jobs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}