import { Router } from 'express';
import type { ApiSuccess } from '@arts/shared';
import { authRouter } from '../../modules/auth/auth.routes.js';
import { categoriesRouter } from '../../modules/catalog/categories/categories.routes.js';
import { productsRouter } from '../../modules/catalog/products/products.routes.js';
import { collectionsRouter } from '../../modules/content/collections/collections.routes.js';
import { contentRouter } from '../../modules/content/pages/pages.routes.js';
import { inventoryRouter } from '../../modules/inventory/inventory.routes.js';
import { mediaRouter } from '../../modules/media/media.routes.js';
import { analyticsRouter } from '../../modules/analytics/analytics.routes.js';

/**
 * Version 1 API router.
 *
 * Feature routers (products, categories, inventory, media, ...) are mounted
 * here. Versioning the router lets us evolve the API without breaking existing
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

v1Router.use('/auth', authRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/products', productsRouter);
v1Router.use('/collections', collectionsRouter);
v1Router.use('/content', contentRouter);
v1Router.use('/inventory', inventoryRouter);
v1Router.use('/media', mediaRouter);
v1Router.use('/analytics', analyticsRouter);
