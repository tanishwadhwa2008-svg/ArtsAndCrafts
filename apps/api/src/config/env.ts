import { z } from 'zod';

/**
 * Centralized, validated application configuration.
 *
 * All environment access goes through this module so the rest of the codebase
 * never touches `process.env` directly. Validation is fail-fast: if required
 * configuration is missing or malformed the process exits at startup rather
 * than failing unpredictably at request time (OWASP A05 — misconfiguration).
 *
 * As the platform grows (auth, storage, payments), add the relevant variables
 * to `envSchema` and they become type-safe everywhere via the exported `env`.
 */
const nodeEnvSchema = z.enum(['development', 'test', 'production']);

const envSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),

  // HTTP server
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().min(1).default('localhost'),

  // Comma-separated list of allowed browser origins for CORS.
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  // Database
  DATABASE_URL: z.string().url(),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  // Authentication (self-managed JWT). Secrets must be long & random —
  // generate with `openssl rand -base64 48`.
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  // Access-token lifetime, expressed as a `jose`-compatible duration.
  JWT_ACCESS_TTL: z.string().default('15m'),
  // Refresh-token lifetime in days (used for cookie maxAge and DB expiry).
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  // Optional cookie domain (leave unset for host-only cookies in local dev).
  COOKIE_DOMAIN: z.string().optional(),

  // Object storage (S3-compatible; MinIO in local dev). Optional — the media
  // endpoints report unavailable until these are configured.
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  // Public base URL for serving objects (defaults to `${S3_ENDPOINT}/${bucket}`).
  S3_PUBLIC_URL: z.string().url().optional(),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default('true')
    .transform((value) => value !== 'false'),

  // Trust the first proxy hop (needed for correct client IPs / rate limiting
  // behind a reverse proxy). Disabled by default for local development.
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Extra validation that only applies in production, kept as a pure function so
 * it is unit-testable. Guards against two common, dangerous deploy mistakes:
 *
 * 1. Shipping with development/default/weak JWT secrets.
 * 2. Leaving CORS open to localhost, `*`, or insecure (http) origins.
 */
export function collectProductionIssues(config: Env, rawCorsOrigins: string | undefined): string[] {
  const issues: string[] = [];

  const looksWeak = (secret: string): boolean =>
    secret.length < 48 ||
    /change[_-]?me|replace[_-]?with|dev[_-]|example|secret123|password/i.test(secret);

  if (looksWeak(config.JWT_ACCESS_SECRET)) {
    issues.push(
      'JWT_ACCESS_SECRET looks like a weak/default secret (use `openssl rand -base64 48`)',
    );
  }
  if (looksWeak(config.JWT_REFRESH_SECRET)) {
    issues.push(
      'JWT_REFRESH_SECRET looks like a weak/default secret (use `openssl rand -base64 48`)',
    );
  }
  if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    issues.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }

  if (!rawCorsOrigins || rawCorsOrigins.trim() === '') {
    issues.push('CORS_ORIGINS must be set explicitly in production');
  }
  for (const origin of config.CORS_ORIGINS) {
    if (origin === '*') {
      issues.push('CORS_ORIGINS may not be "*" in production');
    } else if (/localhost|127\.0\.0\.1/.test(origin)) {
      issues.push(`CORS origin "${origin}" (localhost) is not allowed in production`);
    } else if (origin.startsWith('http://')) {
      issues.push(`CORS origin "${origin}" must use https in production`);
    }
  }

  return issues;
}

function loadEnv(): Env {
  // In non-production, populate process.env from a local `.env` file if one
  // exists. Production supplies real environment variables, so a missing file
  // is not an error. Uses Node's built-in loader (no dotenv dependency).
  if (process.env.NODE_ENV !== 'production') {
    try {
      process.loadEnvFile();
    } catch {
      // No local .env file — fall back to the ambient environment.
    }
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    // Use console here intentionally: the logger may itself depend on config.
    console.error(`Invalid environment configuration:\n${details}`);
    process.exit(1);
  }

  // Stricter production-only guards (weak secrets, unsafe CORS).
  if (parsed.data.NODE_ENV === 'production') {
    const issues = collectProductionIssues(parsed.data, process.env.CORS_ORIGINS);
    if (issues.length > 0) {
      const details = issues.map((issue) => `  - ${issue}`).join('\n');
      console.error(`Insecure production configuration:\n${details}`);
      process.exit(1);
    }
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/** Whether S3-compatible object storage is fully configured. */
export const isStorageConfigured = Boolean(
  env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY && env.S3_BUCKET,
);
