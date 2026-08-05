"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700">
          🧭
        </div>

        <span className="text-xl font-bold tracking-tight text-slate-950">
          Job<span className="text-teal-600">Compass</span>
        </span>
      </Link>

      <div className="relative hidden w-full max-w-xl md:block">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search jobs, companies, or keywords"
          className="h-12 rounded-2xl border-slate-200 pl-12"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 lg:gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 lg:h-11 lg:w-11">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
            2
          </span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700 sm:flex"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <Avatar className="h-10 w-10 lg:h-11 lg:w-11">
          <AvatarFallback className="bg-teal-100 font-semibold text-teal-700">
            G
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}