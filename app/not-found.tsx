import Link from "next/link";
import { ArrowLeft, Compass, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Compass className="h-10 w-10" />
        </div>

        <p className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          404 · Page not found
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
          This page went off route.
        </h1>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          The page you are looking for does not exist, was moved, or is no longer
          available.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to dashboard
          </Link>

          <Link
            href="/jobs"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <Search className="mr-2 h-5 w-5" />
            Browse jobs
          </Link>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </section>
    </main>
  );
}