import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/require-api-user";
import { parseResumeFile } from "@/lib/resume/parse-resume-file";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, DOCX, or plain text files are supported" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Resume must be 5 MB or smaller" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const safeName = sanitizeFilename(file.name);
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);

    return NextResponse.json(
      {
        error:
          uploadError.message.includes("Bucket not found")
            ? "Resume storage is not configured. Run the resume/onboarding migration in Supabase."
            : uploadError.message,
      },
      { status: 500 }
    );
  }

  const uploadedAt = new Date().toISOString();
  const parseResult = await parseResumeFile(fileBuffer, file.type);

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({
      resume_path: storagePath,
      resume_filename: file.name,
      resume_uploaded_at: uploadedAt,
    })
    .eq("id", user.id)
    .select("resume_path, resume_filename, resume_uploaded_at")
    .maybeSingle();

  if (updateError) {
    console.error(updateError);

    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    resumePath: updatedProfile?.resume_path ?? storagePath,
    resumeFilename: updatedProfile?.resume_filename ?? file.name,
    resumeUploadedAt: updatedProfile?.resume_uploaded_at ?? uploadedAt,
    parseResult,
  });
}

export async function DELETE() {
  const { user, response } = await requireApiUser();

  if (response) {
    return response;
  }

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("resume_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);

    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const resumePath = profile?.resume_path as string | undefined;

  if (resumePath) {
    const { error: removeError } = await supabase.storage
      .from("resumes")
      .remove([resumePath]);

    if (removeError) {
      console.error(removeError);
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      resume_path: "",
      resume_filename: "",
      resume_uploaded_at: null,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error(updateError);

    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
