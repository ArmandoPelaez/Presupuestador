import { api } from "@/lib/api";
import type { AiQuoteDraft } from "@/types/api";

export function generateAiQuoteDraft(description: string) {
  return api<AiQuoteDraft>("/ai/quote-drafts", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}
