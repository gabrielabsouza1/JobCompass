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
  const { user, isLoadingUser } = useCurrentUser();

  useEffect(() => {
    if (isLoadingUser || !user) {
      return;
    }

    const isOnboardingRoute = pathname === "/onboarding";
    const shouldOnboard = needsOnboarding({
      fullName: user.fullName,
      email: user.email,
      countryCode: user.countryCode,
      countryName: user.countryName,
      stateCode: user.stateCode,
      stateName: user.stateName,
      cityName: user.cityName,
      workMode: user.workMode,
      employmentType: user.employmentType,
      workRights: user.workRights,
      targetRoles: user.targetRoles,
      skills: user.skills,
      resumePath: user.resumePath,
      resumeFilename: user.resumeFilename,
      resumeUploadedAt: user.resumeUploadedAt,
      onboardingCompletedAt: user.onboardingCompletedAt,
    });

    if (shouldOnboard && !isOnboardingRoute) {
      router.replace("/onboarding");
      return;
    }

    if (!shouldOnboard && isOnboardingRoute) {
      router.replace("/dashboard");
    }
  }, [isLoadingUser, pathname, router, user]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-600">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
