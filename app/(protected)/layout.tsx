import { ProtectedRoute } from "@/components/auth/protected-route";
import { OnboardingRedirect } from "@/components/auth/onboarding-redirect";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingRedirect>{children}</OnboardingRedirect>
    </ProtectedRoute>
  );
}