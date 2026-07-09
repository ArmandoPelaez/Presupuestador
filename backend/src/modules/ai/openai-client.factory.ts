import OpenAI from 'openai';

export interface OpenAiClientOptions {
  apiKey: string;
  timeoutMs: number;
}

export function createOpenAiClient({
  apiKey,
  timeoutMs,
}: OpenAiClientOptions): OpenAI {
  return new OpenAI({
    apiKey,
    timeout: timeoutMs,
  });
}
