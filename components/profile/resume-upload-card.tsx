"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Sparkles, Trash2, Upload } from "lucide-react";

import { ResumeParseSuggestions } from "@/components/profile/resume-parse-suggestions";
import { Button } from "@/components/ui/button";
import type { ResumeParseResult } from "@/lib/resume/parse-resume-content";
import { patchProfile } from "@/lib/profile/patch-profile";

type ResumeUploadCardProps = {
  resumeFilename?: string;
  resumeUploadedAt?: string | null;
  currentSkills?: string[];
  currentTargetRoles?: string[];
  onUploaded?: (payload: {
    resumePath: string;
    resumeFilename: string;
    resumeUploadedAt: string;
  }) => void;
  onRemoved?: () => void;
  onProfileUpdated?: (payload: {
    skills: string[];
    targetRoles: string[];
  }) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

export function ResumeUploadCard({
  resumeFilename,
  resumeUploadedAt,
  currentSkills = [],
  currentTargetRoles = [],
  onUploaded,
  onRemoved,
  onProfileUpdated,
  onError,
  onSuccess,
}: ResumeUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [parseResult, setParseResult] = useState<ResumeParseResult | null>(
    null
  );

  async function handleParseResponse(data: {
    parseResult?: ResumeParseResult | null;
    error?: string;
  }) {
    if (data.parseResult) {
      setParseResult(data.parseResult);
      return;
    }

    if (data.error) {
      onError?.(data.error);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setParseResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/resume", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        resumePath?: string;
        resumeFilename?: string;
        resumeUploadedAt?: string;
        parseResult?: ResumeParseResult | null;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not upload resume");
      }

      if (data.resumePath && data.resumeFilename && data.resumeUploadedAt) {
        onUploaded?.({
          resumePath: data.resumePath,
          resumeFilename: data.resumeFilename,
          resumeUploadedAt: data.resumeUploadedAt,
        });
      }

      await handleParseResponse(data);
      onSuccess?.("Resume uploaded");
    } catch (error) {
      console.error(error);
      onError?.(
        error instanceof Error ? error.message : "Could not upload resume"
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleParseExistingResume() {
    setIsParsing(true);

    try {
      const response = await fetch("/api/profile/resume/parse", {
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        parseResult?: ResumeParseResult;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not parse resume");
      }

      if (data.parseResult) {
        setParseResult(data.parseResult);
        onSuccess?.("Resume parsed");
      }
    } catch (error) {
      console.error(error);
      onError?.(
        error instanceof Error ? error.message : "Could not parse resume"
      );
    } finally {
      setIsParsing(false);
    }
  }

  async function handleApplySuggestions(payload: {
    skills: string[];
    targetRoles: string[];
  }) {
    setIsApplying(true);

    try {
      const profile = await patchProfile({
        skills: payload.skills,
        targetRoles: payload.targetRoles,
      });

      if (!profile) {
        throw new Error("Could not update profile");
      }

      onProfileUpdated?.({
        skills: profile.skills,
        targetRoles: profile.targetRoles,
      });
      setParseResult(null);
      onSuccess?.("Profile updated from resume");
    } catch (error) {
      console.error(error);
      onError?.(
        error instanceof Error ? error.message : "Could not update profile"
      );
    } finally {
      setIsApplying(false);
    }
  }

  async function handleRemoveResume() {
    setIsRemoving(true);

    try {
      const response = await fetch("/api/profile/resume", {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not remove resume");
      }

      setParseResult(null);
      onRemoved?.();
      onSuccess?.("Resume removed");
    } catch (error) {
      console.error(error);
      onError?.(
        error instanceof Error ? error.message : "Could not remove resume"
      );
    } finally {
      setIsRemoving(false);
    }
  }

  const hasResume = Boolean(resumeFilename);
  const isBusy = isUploading || isRemoving || isParsing || isApplying;

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700">
            <FileText className="h-6 w-6" />
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              {hasResume ? resumeFilename : "Resume not uploaded yet"}
            </p>
            <p className="text-sm text-slate-500">
              {hasResume
                ? resumeUploadedAt
                  ? `Uploaded ${new Date(resumeUploadedAt).toLocaleDateString()}`
                  : "Resume uploaded"
                : "PDF, DOCX or plain text up to 5 MB."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(event) => {
              void handleFileChange(event);
            }}
          />

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl border-slate-200 bg-white"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {hasResume ? "Replace resume" : "Upload resume"}
          </Button>

          {hasResume ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 bg-white"
              disabled={isBusy}
              onClick={() => {
                void handleParseExistingResume();
              }}
            >
              {isParsing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Extract skills
            </Button>
          ) : null}

          {hasResume ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-red-200 bg-white text-red-700 hover:bg-red-50"
              disabled={isBusy}
              onClick={() => {
                void handleRemoveResume();
              }}
            >
              {isRemoving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {parseResult ? (
        <ResumeParseSuggestions
          parseResult={parseResult}
          currentSkills={currentSkills}
          currentTargetRoles={currentTargetRoles}
          isApplying={isApplying}
          onApply={(payload) => {
            void handleApplySuggestions(payload);
          }}
          onDismiss={() => setParseResult(null)}
        />
      ) : null}
    </div>
  );
}
