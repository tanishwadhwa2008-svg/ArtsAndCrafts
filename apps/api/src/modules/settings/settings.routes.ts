import { Router } from 'express';
import { updateStorefrontSettingsSchema } from '@arts/shared';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
import * as controller from './settings.controller.js';

/** Storefront settings routes, mounted at `/api/v1/settings`. Sellers/admins only. */
export const settingsRouter = Router();

settingsRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

settingsRouter.get('/', asyncHandler(controller.getSettingsHandler));

settingsRouter.patch(
  '/',
  validate({ body: updateStorefrontSettingsSchema }),
  asyncHandler(controller.updateSettingsHandler),
);
