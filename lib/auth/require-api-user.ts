import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function requireApiUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    user,
    response: null,
  };
}