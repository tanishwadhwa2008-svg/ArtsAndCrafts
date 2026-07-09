import { Router } from 'express';
import { z } from 'zod';
import {
  contentBlockInputSchema,
  contentPageListQuerySchema,
  createContentPageSchema,
  idParamSchema,
  reorderBlocksSchema,
  updateContentPageSchema,
} from '@arts/shared';
import { validate } from '../../../middleware/validate.js';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { requireAuth } from '../../../middleware/require-auth.js';
import { requireRole } from '../../../middleware/require-role.js';
import * as controller from './pages.controller.js';

const blockParamsSchema = z.object({
  id: z.string().cuid(),
  blockId: z.string().cuid(),
});

/** Content (pages + blocks) routes, mounted at `/api/v1/content`. */
export const contentRouter = Router();

contentRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

// Singleton homepage convenience (get-or-create).
contentRouter.get('/home', asyncHandler(controller.getHomeHandler));

// Pages.
contentRouter.get(
  '/pages',
  validate({ query: contentPageListQuerySchema }),
  asyncHandler(controller.listContentPagesHandler),
);
contentRouter.post(
  '/pages',
  validate({ body: createContentPageSchema }),
  asyncHandler(controller.createContentPageHandler),
);
contentRouter.get(
  '/pages/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.getContentPageHandler),
);
contentRouter.patch(
  '/pages/:id',
  validate({ params: idParamSchema, body: updateContentPageSchema }),
  asyncHandler(controller.updateContentPageHandler),
);
contentRouter.delete(
  '/pages/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteContentPageHandler),
);

// Blocks (nested under a page).
contentRouter.post(
  '/pages/:id/blocks',
  validate({ params: idParamSchema, body: contentBlockInputSchema }),
  asyncHandler(controller.addBlockHandler),
);
contentRouter.put(
  '/pages/:id/blocks/order',
  validate({ params: idParamSchema, body: reorderBlocksSchema }),
  asyncHandler(controller.reorderBlocksHandler),
);
contentRouter.patch(
  '/pages/:id/blocks/:blockId',
  validate({ params: blockParamsSchema, body: contentBlockInputSchema }),
  asyncHandler(controller.updateBlockHandler),
);
contentRouter.delete(
  '/pages/:id/blocks/:blockId',
  validate({ params: blockParamsSchema }),
  asyncHandler(controller.deleteBlockHandler),
);
