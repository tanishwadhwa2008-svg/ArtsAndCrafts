import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    // Keep tests hermetic and quiet; overrides local .env values.
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      JWT_ACCESS_SECRET: 'test_access_secret_0123456789abcdefghijklmnop',
      JWT_REFRESH_SECRET: 'test_refresh_secret_0123456789abcdefghijklmnop',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL_DAYS: '7',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_ACCESS_KEY: 'minioadmin',
      S3_SECRET_KEY: 'minioadmin',
      S3_BUCKET: 'arts-media',
    },
  },
});
