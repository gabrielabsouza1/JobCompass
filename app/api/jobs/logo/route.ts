import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { fetchAdzunaLogoUrl } from "@/lib/jobs/extract-adzuna-logo";

function isAllowedAdzunaRedirectUrl(redirectUrl: string) {
  try {
    const hostname = new URL(redirectUrl).hostname.toLowerCase();

    return hostname.includes("adzuna");
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const redirectUrl = request.nextUrl.searchParams.get("redirect");

  if (!redirectUrl || !isAllowedAdzunaRedirectUrl(redirectUrl)) {
    return NextResponse.json({ url: null });
  }

  const url = await fetchAdzunaLogoUrl(redirectUrl);

  return NextResponse.json(
    { url },
    {
      headers: {
        "Cache-Control": "private, max-age=86400",
      },
    }
  );
}
