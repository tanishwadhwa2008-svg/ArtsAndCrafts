import { Router } from 'express';
import {
  attachImageSchema,
  createProductSchema,
  idParamSchema,
  productListQuerySchema,
  updateImageSchema,
  updateProductSchema,
} from '@arts/shared';
import { validate } from '../../../middleware/validate.js';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { requireAuth } from '../../../middleware/require-auth.js';
import { requireRole } from '../../../middleware/require-role.js';
import * as controller from './products.controller.js';

/** Product routes, mounted at `/api/v1/products`. Sellers/admins only. */
export const productsRouter = Router();

productsRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

// Products
productsRouter.get(
  '/',
  validate({ query: productListQuerySchema }),
  asyncHandler(controller.listProductsHandler),
);
productsRouter.post(
  '/',
  validate({ body: createProductSchema }),
  asyncHandler(controller.createProductHandler),
);
productsRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.getProductHandler),
);
productsRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateProductSchema }),
  asyncHandler(controller.updateProductHandler),
);
productsRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteProductHandler),
);

// Images (nested create; update/delete by image id)
productsRouter.post(
  '/:id/images',
  validate({ params: idParamSchema, body: attachImageSchema }),
  asyncHandler(controller.createImageHandler),
);
productsRouter.patch(
  '/images/:id',
  validate({ params: idParamSchema, body: updateImageSchema }),
  asyncHandler(controller.updateImageHandler),
);
productsRouter.delete(
  '/images/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteImageHandler),
);
