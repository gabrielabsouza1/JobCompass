"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/use-current-user";
import { needsOnboarding } from "@/lib/profile/onboarding";

export function OnboardingRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoadingUser, applyProfile } = useCurrentUser();

  useEffect(() => {
    if (isLoadingUser || !user) {
      return;
    }

    let isMounted = true;

    async function checkRedirect() {
      const isOnboardingRoute = pathname === "/onboarding";

      function profileNeedsOnboarding(profile: {
        fullName: string;
        email: string;
        countryCode: string;
        countryName: string;
        stateCode: string;
        stateName: string;
        cityName: string;
        workMode: string;
        employmentType: string;
        workRights: string;
        targetRoles: string[];
        skills: string[];
        resumePath: string;
        resumeFilename: string;
        resumeUploadedAt: string | null;
        onboardingCompletedAt: string | null;
      }) {
        return needsOnboarding(profile);
      }

      let activeProfile = {
        fullName: user!.fullName,
        email: user!.email,
        countryCode: user!.countryCode,
        countryName: user!.countryName,
        stateCode: user!.stateCode,
        stateName: user!.stateName,
        cityName: user!.cityName,
        workMode: user!.workMode,
        employmentType: user!.employmentType,
        workRights: user!.workRights,
        targetRoles: user!.targetRoles,
        skills: user!.skills,
        resumePath: user!.resumePath,
        resumeFilename: user!.resumeFilename,
        resumeUploadedAt: user!.resumeUploadedAt,
        onboardingCompletedAt: user!.onboardingCompletedAt,
      };

      if (profileNeedsOnboarding(activeProfile) && !isOnboardingRoute) {
        try {
          const response = await fetch("/api/profile", { cache: "no-store" });

          if (response.ok) {
            const data = (await response.json()) as {
              profile?: typeof activeProfile;
            };

            if (data.profile?.onboardingCompletedAt) {
              if (!isMounted) {
                return;
              }

              applyProfile(data.profile);
              return;
            }
          }
        } catch (error) {
          console.error(error);
        }

        if (!isMounted) {
          return;
        }

        router.replace("/onboarding");
        return;
      }

      if (!profileNeedsOnboarding(activeProfile) && isOnboardingRoute) {
        router.replace("/dashboard");
      }
    }

    void checkRedirect();

    return () => {
      isMounted = false;
    };
  }, [applyProfile, isLoadingUser, pathname, router, user]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-600">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
