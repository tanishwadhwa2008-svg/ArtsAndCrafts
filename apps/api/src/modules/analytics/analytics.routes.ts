import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
import * as controller from './analytics.controller.js';

/** Analytics routes, mounted at `/api/v1/analytics`. Sellers/admins only. */
export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

analyticsRouter.get('/summary', asyncHandler(controller.getSummaryHandler));
