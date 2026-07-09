import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  it('carga defaults de IA sin exigir clave de OpenAI', () => {
    const env = validateEnvironment({
      JWT_SECRET: 'a-secure-test-secret-with-32-characters',
    });

    expect(env.OPENAI_API_KEY).toBeUndefined();
    expect(env.OPENAI_MODEL).toBe('gpt-5.4-mini');
    expect(env.AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH).toBe(2000);
    expect(env.AI_QUOTE_DRAFT_TIMEOUT_MS).toBe(15000);
  });

  it('rechaza limites de IA fuera de rango', () => {
    expect(() =>
      validateEnvironment({
        JWT_SECRET: 'a-secure-test-secret-with-32-characters',
        AI_QUOTE_DRAFT_DESCRIPTION_MAX_LENGTH: '50',
      }),
    ).toThrow('Invalid environment');

    expect(() =>
      validateEnvironment({
        JWT_SECRET: 'a-secure-test-secret-with-32-characters',
        AI_QUOTE_DRAFT_TIMEOUT_MS: '999',
      }),
    ).toThrow('Invalid environment');
  });
});
