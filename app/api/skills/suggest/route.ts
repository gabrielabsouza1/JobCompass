import { NextRequest, NextResponse } from "next/server";

import { searchSkillSuggestions } from "@/data/skill-suggestions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const suggestions = searchSkillSuggestions(query);

  return NextResponse.json({ suggestions });
}
