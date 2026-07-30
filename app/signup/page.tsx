import Link from "next/link";
import { ArrowRight, Lock, Mail, UserCircle } from "lucide-react";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_560px]">
        <section className="hidden bg-gradient-to-br from-teal-50 via-sky-50 to-white p-10 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-white text-teal-700">
              🧭
            </div>

            <span className="text-2xl font-bold tracking-tight text-slate-950">
              Job<span className="text-teal-600">Compass</span>
            </span>
          </Link>

          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
              Start your Australian job search
            </p>

            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-slate-950">
              Create your profile and find better job matches.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Set your location, target roles, work preferences and job sources
              in one guided flow.
            </p>
          </div>

          <div className="grid gap-3">
            {["Choose local job sources", "Save jobs", "Track applications"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                🧭
              </div>

              <span className="text-2xl font-bold tracking-tight text-slate-950">
                Job<span className="text-teal-600">Compass</span>
              </span>
            </Link>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="mb-2 text-sm font-semibold text-teal-700">
                  Sign up
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Create your account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Mock signup for now. Real authentication will be connected
                  later.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>

                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      placeholder="Your name"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Create a password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>
                </div>

                <Link
                  href="/onboarding"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-teal-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}