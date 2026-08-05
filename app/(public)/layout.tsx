import { PublicRoute } from "@/components/auth/public-route";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicRoute>{children}</PublicRoute>;
}