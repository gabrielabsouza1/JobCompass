"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type ResumeUploadCardProps = {
  resumeFilename?: string;
  resumeUploadedAt?: string | null;
  onUploaded?: (payload: {
    resumePath: string;
    resumeFilename: string;
    resumeUploadedAt: string;
  }) => void;
  onRemoved?: () => void;
  onError?: (message: string) => void;
};

export function ResumeUploadCard({
  resumeFilename,
  resumeUploadedAt,
  onUploaded,
  onRemoved,
  onError,
}: ResumeUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

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

      onRemoved?.();
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
            disabled={isUploading || isRemoving}
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
              className="h-11 rounded-2xl border-red-200 bg-white text-red-700 hover:bg-red-50"
              disabled={isUploading || isRemoving}
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
    </div>
  );
}
