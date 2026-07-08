import { Router } from 'express';
import type { ApiSuccess } from '@arts/shared';
import { prisma } from '../db/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { AppError } from '../lib/errors.js';

/**
 * Health & readiness probes.
 *
 * - `GET /health`        liveness: process is up (no dependencies checked).
 * - `GET /health/ready`  readiness: verifies database connectivity.
 *
 * Mounted at the root (not under `/api/v1`) so infrastructure/orchestration
 * probes have a stable, unversioned path.
 */
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const body: ApiSuccess<{ status: string; uptime: number }> = {
    ok: true,
    data: { status: 'healthy', uptime: process.uptime() },
  };
  res.json(body);
});

healthRouter.get(
  '/ready',
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new AppError('Database not reachable', {
        statusCode: 503,
        code: 'NOT_READY',
      });
    }

    const body: ApiSuccess<{ status: string }> = {
      ok: true,
      data: { status: 'ready' },
    };
    res.json(body);
  }),
);
