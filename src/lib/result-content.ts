import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

export const validateResultSearch = zodValidator(z.object({
  content: fallback(z.string().optional(), undefined),
}));

export function resolveResultContent(content: string | undefined, scannedText: string | undefined): string {
  return content ?? scannedText ?? "";
}