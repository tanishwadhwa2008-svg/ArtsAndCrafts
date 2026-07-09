/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace design system + shared packages (needed so Next
  // processes their "use client" directives and modern syntax).
  transpilePackages: ['@arts/ui', '@arts/shared'],
  // We lint via the monorepo ESLint flat config (`pnpm lint`), not `next lint`.
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Remote sources allowed for next/image. MinIO in local dev; add the
    // production object-storage host in E27 (deploy) alongside the CDN domain.
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
