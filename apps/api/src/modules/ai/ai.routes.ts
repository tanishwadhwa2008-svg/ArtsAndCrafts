import { Router } from 'express';
import { aiCollectionDraftRequestSchema } from '@arts/shared';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
import { aiRateLimiter } from '../../middleware/ai-rate-limit.js';
import * as controller from './ai.controller.js';

/**
 * AI-assisted bulk cataloguing routes, mounted at `/api/v1/ai`. Sellers/admins
 * only. The draft endpoint is rate-limited (vision calls are costly) and reports
 * 503 when no AI credentials are configured.
 */
export const aiRouter = Router();

aiRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

aiRouter.get('/status', controller.aiStatusHandler);

aiRouter.post(
  '/collection-draft',
  aiRateLimiter,
  validate({ body: aiCollectionDraftRequestSchema }),
  asyncHandler(controller.collectionDraftHandler),
);
