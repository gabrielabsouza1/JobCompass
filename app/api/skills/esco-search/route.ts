import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { searchEscoSkills } from "@/lib/skills/esco-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    10,
    Math.max(1, Number(searchParams.get("limit")) || 5)
  );

  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchEscoSkills(query, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not search ESCO skills" },
      { status: 502 }
    );
  }
}
