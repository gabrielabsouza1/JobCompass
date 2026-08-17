import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { getSkillSuggestions } from "@/lib/skills/search-skill-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const excludeParam = searchParams.get("exclude") ?? "";
  const exclude = excludeParam
    .split("|")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const limit = Math.min(
    20,
    Math.max(1, Number(searchParams.get("limit")) || 8)
  );

  try {
    const result = await getSkillSuggestions(query, limit, exclude);

    return NextResponse.json({
      suggestions: result.suggestions,
      entries: result.entries,
      source: result.source,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Could not load skill suggestions" },
      { status: 500 }
    );
  }
}
