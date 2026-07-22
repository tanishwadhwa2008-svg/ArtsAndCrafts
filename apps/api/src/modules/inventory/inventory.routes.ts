import { Router } from 'express';
import { adjustInventorySchema, idParamSchema, inventoryListQuerySchema } from '@arts/shared';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
import * as controller from './inventory.controller.js';

/** Inventory routes, mounted at `/api/v1/inventory`. Sellers/admins only. */
export const inventoryRouter = Router();

inventoryRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

inventoryRouter.get(
  '/',
  validate({ query: inventoryListQuerySchema }),
  asyncHandler(controller.listInventoryHandler),
);

// `:id` is the product id whose stock is being adjusted.
inventoryRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: adjustInventorySchema }),
  asyncHandler(controller.adjustInventoryHandler),
);
