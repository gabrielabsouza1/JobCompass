import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { getAdzunaJobs } from "@/lib/jobs/providers/adzuna-provider";

export async function GET() {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const jobs = await getAdzunaJobs({
    countryCode: "AU",
    what: "qa tester",
    where: "Melbourne",
    resultsPerPage: 5,
  });

  return NextResponse.json({
    jobs,
    total: jobs.length,
  });
}