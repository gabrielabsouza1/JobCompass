import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AppSidebar />

        <main className="min-h-screen flex-1 pb-24 lg:pb-0">
          <Topbar />
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}