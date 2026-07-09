import { z } from 'zod';

/**
 * Validated storefront configuration. Server code and build config read
 * settings from here rather than touching `process.env` directly.
 *
 * `NEXT_PUBLIC_*` values are inlined by Next into both server and client
 * bundles; everything else is server-only and must never be referenced from a
 * Client Component. All values default to local-dev endpoints so the app runs
 * with no `.env` file; production supplies real values (see `.env.example`).
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_MEDIA_BASE_URL: z.string().url().default('http://localhost:9000'),
  API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
});

// Reference each key explicitly so Next can statically inline the public vars.
const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid storefront environment configuration:\n${details}`);
}

export const env = {
  /** Public URL of the storefront itself (metadata, canonical, OG). */
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL,
  /** Public base URL for media/object storage (image src + next/image host). */
  mediaBaseUrl: parsed.data.NEXT_PUBLIC_MEDIA_BASE_URL,
  /** Server-side base URL for the public storefront API (RSC data fetching). */
  apiBaseUrl: parsed.data.API_BASE_URL,
} as const;
