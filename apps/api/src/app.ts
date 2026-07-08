import express, { type Express } from 'express';

/**
 * Builds the Express application.
 *
 * Phase 0 keeps this intentionally minimal — only a health endpoint.
 * Security middleware (helmet, CORS, rate-limiting), the versioned
 * `/api/v1` router, auth, and error handling are added in later phases.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, data: { status: 'healthy', uptime: process.uptime() } });
  });

  return app;
}
