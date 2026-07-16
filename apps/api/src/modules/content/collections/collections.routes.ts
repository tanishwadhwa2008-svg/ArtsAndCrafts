import { Router } from 'express';
import {
  aiCommitSchema,
  collectionListQuerySchema,
  createCollectionSchema,
  idParamSchema,
  setCollectionProductsSchema,
  updateCollectionSchema,
} from '@arts/shared';
import { validate } from '../../../middleware/validate.js';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { requireAuth } from '../../../middleware/require-auth.js';
import { requireRole } from '../../../middleware/require-role.js';
import * as controller from './collections.controller.js';

/** Collection routes, mounted at `/api/v1/collections`. Sellers/admins only. */
export const collectionsRouter = Router();

collectionsRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

collectionsRouter.get(
  '/',
  validate({ query: collectionListQuerySchema }),
  asyncHandler(controller.listCollectionsHandler),
);

collectionsRouter.post(
  '/',
  validate({ body: createCollectionSchema }),
  asyncHandler(controller.createCollectionHandler),
);

collectionsRouter.post(
  '/ai-commit',
  validate({ body: aiCommitSchema }),
  asyncHandler(controller.aiCommitHandler),
);

collectionsRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.getCollectionHandler),
);

collectionsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateCollectionSchema }),
  asyncHandler(controller.updateCollectionHandler),
);

collectionsRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteCollectionHandler),
);

collectionsRouter.put(
  '/:id/products',
  validate({ params: idParamSchema, body: setCollectionProductsSchema }),
  asyncHandler(controller.setCollectionProductsHandler),
);
