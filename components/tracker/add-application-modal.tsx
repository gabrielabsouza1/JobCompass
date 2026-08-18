import type { Dispatch, SetStateAction } from "react";
import type { ApplicationStatus, Job } from "@/types";
import { Button } from "@/components/ui/button";

type NewApplicationForm = {
  jobId: string;
  status: ApplicationStatus;
  nextStep: string;
  notes: string;
};

type AddApplicationModalProps = {
  isOpen: boolean;
  jobs: Job[];
  newApplication: NewApplicationForm;
  setNewApplication: Dispatch<SetStateAction<NewApplicationForm>>;
  onClose: () => void;
  onSave: () => void;
};

export function AddApplicationModal({
  isOpen,
  jobs,
  newApplication,
  setNewApplication,
  onClose,
  onSave,
}: AddApplicationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Application tracker
            </p>

            <h2 className="text-2xl font-bold text-slate-950">
              Add application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track a saved job and move it through your application pipeline.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close add application modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Job
            </label>

            <select
              value={newApplication.jobId}
              onChange={(event) =>
                setNewApplication((current) => ({
                  ...current,
                  jobId: event.target.value,
                }))
              }
              disabled={jobs.length === 0}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {jobs.length === 0 ? (
                <option value="">Save a job first</option>
              ) : null}
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={newApplication.status}
              onChange={(event) =>
                setNewApplication((current) => ({
                  ...current,
                  status: event.target.value as ApplicationStatus,
                }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Next step
            </label>

            <input
              value={newApplication.nextStep}
              onChange={(event) =>
                setNewApplication((current) => ({
                  ...current,
                  nextStep: event.target.value,
                }))
              }
              placeholder="Example: Follow up next week"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Notes
            </label>

            <textarea
              value={newApplication.notes}
              onChange={(event) =>
                setNewApplication((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Add any notes about this application"
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-2xl border-slate-200 px-6"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={onSave}
              className="h-11 rounded-2xl bg-teal-600 px-6 hover:bg-teal-700"
            >
              Save application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}