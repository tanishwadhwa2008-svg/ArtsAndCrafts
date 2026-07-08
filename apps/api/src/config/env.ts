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

  // Trust the first proxy hop (needed for correct client IPs / rate limiting
  // behind a reverse proxy). Disabled by default for local development.
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

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

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
