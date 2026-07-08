import { describe, expect, it } from 'vitest';
import { collectProductionIssues, type Env } from '../src/config/env.js';
import { serializeMoney } from '../src/lib/money.js';

const strongSecretA = 'A'.repeat(20) + 'kQ7z9F2pLw8vX3mR6tN1bY4cH0sJ5dG';
const strongSecretB = 'B'.repeat(20) + 'uW2eR9tY6uI3oP8aS5dF1gH7jK0lZ4x';

function baseEnv(overrides: Partial<Env> = {}): Env {
  return {
    NODE_ENV: 'production',
    API_PORT: 4000,
    API_HOST: '0.0.0.0',
    CORS_ORIGINS: ['https://shop.example.com'],
    DATABASE_URL: 'postgresql://u:p@db:5432/app',
    LOG_LEVEL: 'info',
    JWT_ACCESS_SECRET: strongSecretA,
    JWT_REFRESH_SECRET: strongSecretB,
    JWT_ACCESS_TTL: '15m',
    JWT_REFRESH_TTL_DAYS: 7,
    COOKIE_DOMAIN: undefined,
    TRUST_PROXY: true,
    ...overrides,
  };
}

describe('collectProductionIssues', () => {
  it('passes a well-configured production environment', () => {
    expect(collectProductionIssues(baseEnv(), 'https://shop.example.com')).toEqual([]);
  });

  it('flags weak/default JWT secrets', () => {
    const issues = collectProductionIssues(
      baseEnv({ JWT_ACCESS_SECRET: 'dev_access_secret_change_me_0123456789abcdef' }),
      'https://shop.example.com',
    );
    expect(issues.some((i) => i.includes('JWT_ACCESS_SECRET'))).toBe(true);
  });

  it('flags identical access and refresh secrets', () => {
    const issues = collectProductionIssues(
      baseEnv({ JWT_REFRESH_SECRET: strongSecretA }),
      'https://shop.example.com',
    );
    expect(issues.some((i) => i.includes('must be different'))).toBe(true);
  });

  it('rejects localhost, wildcard and http CORS origins', () => {
    expect(
      collectProductionIssues(
        baseEnv({ CORS_ORIGINS: ['http://localhost:5173'] }),
        'http://localhost:5173',
      ),
    ).not.toEqual([]);
    expect(collectProductionIssues(baseEnv({ CORS_ORIGINS: ['*'] }), '*')).not.toEqual([]);
    expect(
      collectProductionIssues(
        baseEnv({ CORS_ORIGINS: ['http://shop.example.com'] }),
        'http://shop.example.com',
      ),
    ).not.toEqual([]);
  });

  it('requires CORS_ORIGINS to be set explicitly', () => {
    expect(
      collectProductionIssues(baseEnv(), undefined).some((i) => i.includes('CORS_ORIGINS')),
    ).toBe(true);
  });
});

describe('serializeMoney', () => {
  it('formats decimals, numbers and strings to fixed 2dp strings', () => {
    expect(serializeMoney('28')).toBe('28.00');
    expect(serializeMoney(145.5)).toBe('145.50');
    expect(serializeMoney('76.005')).toBe('76.01');
  });
});
