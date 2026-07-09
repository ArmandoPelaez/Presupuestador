import { ConfigService } from '@nestjs/config';
import { createOpenAiClient } from './openai-client.factory';

export const OPENAI_CLIENT = Symbol('OPENAI_CLIENT');

export const openAiClientProvider = {
  provide: OPENAI_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const apiKey = config.get<string>('app.openAiApiKey');
    if (!apiKey) return null;

    return createOpenAiClient({
      apiKey,
      timeoutMs: config.getOrThrow<number>('app.aiQuoteDraftTimeoutMs'),
    });
  },
};
