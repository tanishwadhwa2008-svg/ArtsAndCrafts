import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from './config/env.js';
import { httpLogger } from './middleware/http-logger.js';
import { globalRateLimiter } from './middleware/rate-limit.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.route.js';
import { v1Router } from './routes/v1/index.js';

/**
 * Builds and wires up the Express application.
 *
 * Middleware order is deliberate: logging first (so every request is
 * captured), then security headers, CORS, body parsing, tamper protection,
 * and rate limiting — before any route runs. Routes are mounted last, followed
 * by the 404 and central error handlers.
 *
 * `createApp` is side-effect free (it does not bind a port), which keeps it
 * trivially testable with supertest.
 */
export function createApp(): Express {
  const app = express();

  // Correct client IPs behind a reverse proxy (opt-in via env).
  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  // Observability — log every request with a correlation id.
  app.use(httpLogger);

  // Security headers (OWASP A05).
  app.use(helmet());

  // Strict CORS from an explicit allowlist; credentials enabled for the
  // httpOnly refresh cookie introduced in Phase 3.
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );

  // Body parsing with conservative size limits (OWASP A05 — resource abuse).
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Guard against HTTP parameter pollution.
  app.use(hpp());

  // Global rate limit as a baseline safety net.
  app.use(globalRateLimiter);

  // Routes.
  app.use('/health', healthRouter);
  app.use('/api/v1', v1Router);

  // Unmatched routes and centralized error handling (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
