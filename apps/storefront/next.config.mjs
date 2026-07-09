/** @type {import('next').NextConfig} */

// Media/object-storage base URL whose host is allowed for next/image. MinIO in
// local dev; an S3 bucket or CDN host in production. Driven by env so deploying
// to a different media host needs no code change. Keep in sync with lib/env.ts.
const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'http://localhost:9000';

/** Build a next/image remote pattern from a base URL, with a safe fallback. */
function mediaRemotePattern(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/**',
    };
  } catch {
    return { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' };
  }
}

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework (OWASP A05 — security misconfiguration).
  poweredByHeader: false,
  // Compile the workspace design system + shared packages (needed so Next
  // processes their "use client" directives and modern syntax).
  transpilePackages: ['@arts/ui', '@arts/shared'],
  // We lint via the monorepo ESLint flat config (`pnpm lint`), not `next lint`.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [mediaRemotePattern(mediaBaseUrl)],
  },
};

export default nextConfig;
