import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "🧭",
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl text-teal-700">
        {icon}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-slate-950">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {actionLabel || secondaryActionLabel ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actionLabel && actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {actionLabel}
            </Link>
          ) : null}

          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              {actionLabel}
            </button>
          ) : null}

          {secondaryActionLabel && secondaryActionHref ? (
            <Link
              href={secondaryActionHref}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
            >
              {secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}