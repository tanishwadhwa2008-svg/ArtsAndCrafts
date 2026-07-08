import { Router } from 'express';
import { uploadUrlSchema } from '@arts/shared';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireRole } from '../../middleware/require-role.js';
import * as controller from './media.controller.js';

/** Media routes, mounted at `/api/v1/media`. Sellers/admins only. */
export const mediaRouter = Router();

mediaRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

mediaRouter.post(
  '/upload-url',
  validate({ body: uploadUrlSchema }),
  asyncHandler(controller.createUploadUrlHandler),
);
