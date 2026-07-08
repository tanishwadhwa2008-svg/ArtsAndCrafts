import { Router } from 'express';
import type { ApiSuccess } from '@arts/shared';

/**
 * Version 1 API router.
 *
 * Feature routers (auth, products, categories, inventory, media, ...) are
 * mounted here in later phases, e.g. `v1Router.use('/products', productsRouter)`.
 * Versioning the router lets us evolve the API without breaking existing
 * clients — a `/api/v2` can be introduced side by side later.
 */
export const v1Router = Router();

v1Router.get('/', (_req, res) => {
  const body: ApiSuccess<{ name: string; version: string }> = {
    ok: true,
    data: { name: 'Arts & Handicrafts API', version: 'v1' },
  };
  res.json(body);
});
