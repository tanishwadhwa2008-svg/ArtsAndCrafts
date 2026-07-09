import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import * as controller from './public.controller.js';

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

const productsQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(48).optional(),
});

/**
 * Public, UNAUTHENTICATED storefront read API, mounted at `/api/v1/public`.
 * Only ACTIVE products and PUBLISHED collections are ever exposed.
 */
export const publicRouter = Router();

publicRouter.get('/home', asyncHandler(controller.homeHandler));

publicRouter.get(
  '/products',
  validate({ query: productsQuerySchema }),
  asyncHandler(controller.listProductsHandler),
);
publicRouter.get(
  '/products/:slug',
  validate({ params: slugParamsSchema }),
  asyncHandler(controller.productBySlugHandler),
);

publicRouter.get('/collections', asyncHandler(controller.listCollectionsHandler));
publicRouter.get(
  '/collections/:slug',
  validate({ params: slugParamsSchema }),
  asyncHandler(controller.collectionBySlugHandler),
);
