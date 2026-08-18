import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { parseResumeFile } from "@/lib/resume/parse-resume-file";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

function guessMimeType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) {
    return "application/pdf";
  }

  return MIME_BY_EXTENSION[extension] ?? "application/pdf";
}

export async function POST() {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("resume_path, resume_filename")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);

    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const resumePath = profile?.resume_path as string | undefined;
  const resumeFilename = profile?.resume_filename as string | undefined;

  if (!resumePath) {
    return NextResponse.json(
      { error: "Upload a resume before parsing" },
      { status: 400 }
    );
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from("resumes")
    .download(resumePath);

  if (downloadError || !fileData) {
    console.error(downloadError);

    return NextResponse.json(
      { error: "Could not read the uploaded resume" },
      { status: 500 }
    );
  }

  const buffer = await fileData.arrayBuffer();
  const mimeType = fileData.type || guessMimeType(resumeFilename ?? resumePath);
  const parseResult = await parseResumeFile(buffer, mimeType);

  if (!parseResult) {
    return NextResponse.json(
      {
        error:
          "Could not extract enough text from this resume. Try a text-based PDF or DOCX file.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({
    parseResult,
    resumeFilename: resumeFilename ?? "",
  });
}
