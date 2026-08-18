import { extractResumeText } from "@/lib/resume/extract-resume-text";
import {
  parseResumeContent,
  type ResumeParseResult,
} from "@/lib/resume/parse-resume-content";

export async function parseResumeFile(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<ResumeParseResult | null> {
  try {
    const text = await extractResumeText(buffer, mimeType);
    const normalized = text.replace(/\s+/g, " ").trim();

    if (normalized.length < 40) {
      return null;
    }

    return parseResumeContent(normalized);
  } catch (error) {
    console.error("Resume parsing failed", error);
    return null;
  }
}
