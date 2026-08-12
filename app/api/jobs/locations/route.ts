import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { getAdzunaLocationFilterOptions } from "@/lib/jobs/adzuna-location-options";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const country = request.nextUrl.searchParams.get("country");
  const state = request.nextUrl.searchParams.get("state");

  try {
    const options = await getAdzunaLocationFilterOptions({
      country,
      state,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not load Adzuna location options" },
      { status: 500 }
    );
  }
}
