import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { normalizeSkill } from "@/lib/profile/skills";
import { isMissingSkillCatalogError } from "@/lib/skills/skill-catalog";
import { upsertEscoSkill } from "@/lib/skills/record-skill-usage";

export const dynamic = "force-dynamic";

type RegisterSkillBody = {
  name?: string;
  escoUri?: string;
  escoType?: string | null;
};

export async function POST(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  let body: RegisterSkillBody;

  try {
    body = (await request.json()) as RegisterSkillBody;
  } catch {
    return NextResponse.json({ error: "Invalid skill payload" }, { status: 400 });
  }

  const name = normalizeSkill(body.name ?? "");
  const escoUri = body.escoUri?.trim();

  if (!name || !escoUri) {
    return NextResponse.json(
      { error: "Skill name and ESCO URI are required" },
      { status: 400 }
    );
  }

  try {
    const savedName = await upsertEscoSkill(name, escoUri, body.escoType ?? null);

    return NextResponse.json({ name: savedName });
  } catch (error) {
    if (isMissingSkillCatalogError(error as { message?: string })) {
      return NextResponse.json(
        {
          error:
            "The skill_catalog table is missing. Run the skill catalog migration in Supabase.",
        },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Could not register ESCO skill" },
      { status: 500 }
    );
  }
}
