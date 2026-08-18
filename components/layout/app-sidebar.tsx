"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BriefcaseBusiness,
  ClipboardCheck,
  Globe2,
  UserCircle,
  ShieldCheck,
  Settings,
  Bookmark,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { calculateProfileCompletion } from "@/lib/profile/calculate-profile-completion";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Tracker", href: "/tracker", icon: ClipboardCheck },
  { label: "Sources", href: "/sources", icon: Globe2 },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const profileCompletion = calculateProfileCompletion({
    countryName: user?.countryName,
    cityName: user?.cityName,
    workMode: user?.workMode,
    employmentType: user?.employmentType,
    workRights: user?.workRights,
    targetRoles: user?.targetRoles,
    skills: user?.skills,
  });

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-6 py-6 lg:flex lg:flex-col">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
          🧭
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-950">
          Job<span className="text-teal-600">Compass</span>
        </span>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition ${pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <h3 className="font-semibold text-slate-950">Boost your success</h3>
        <p className="mt-1 text-sm text-slate-500">
          Complete your profile to get better matches.
        </p>

        <div className="mt-4 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-teal-600 transition-all"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>

        <p className="mt-3 text-sm font-medium text-teal-700">
          {profileCompletion}% complete
        </p>
      </div>
    </aside>
  );
}