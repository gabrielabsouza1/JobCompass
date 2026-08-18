import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export function isSupportedResumeMimeType(mimeType: string) {
  return SUPPORTED_MIME_TYPES.has(mimeType);
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });

  return result.value ?? "";
}

function extractPlainText(buffer: Buffer) {
  return buffer.toString("utf-8");
}

export async function extractResumeText(buffer: ArrayBuffer, mimeType: string) {
  if (!isSupportedResumeMimeType(mimeType)) {
    throw new Error("Unsupported resume file type");
  }

  const nodeBuffer = Buffer.from(buffer);

  if (mimeType === "application/pdf") {
    return extractPdfText(nodeBuffer);
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(nodeBuffer);
  }

  return extractPlainText(nodeBuffer);
}
