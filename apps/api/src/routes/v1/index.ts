import { Router } from 'express';
import type { ApiSuccess } from '@arts/shared';
import { authRouter } from '../../modules/auth/auth.routes.js';

/**
 * Version 1 API router.
 *
 * Feature routers (products, categories, inventory, media, ...) are mounted
 * here in later phases. Versioning the router lets us evolve the API without
 * breaking existing clients — a `/api/v2` can be introduced side by side later.
 */
export const v1Router = Router();

v1Router.get('/', (_req, res) => {
  const body: ApiSuccess<{ name: string; version: string }> = {
    ok: true,
    data: { name: 'Arts & Handicrafts API', version: 'v1' },
  };
  res.json(body);
});

v1Router.use('/auth', authRouter);
