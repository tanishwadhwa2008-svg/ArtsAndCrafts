import { Router } from 'express';
import { createCategorySchema, idParamSchema, updateCategorySchema } from '@arts/shared';
import { validate } from '../../../middleware/validate.js';
import { asyncHandler } from '../../../middleware/async-handler.js';
import { requireAuth } from '../../../middleware/require-auth.js';
import { requireRole } from '../../../middleware/require-role.js';
import * as controller from './categories.controller.js';

/** Category routes, mounted at `/api/v1/categories`. Sellers/admins only. */
export const categoriesRouter = Router();

categoriesRouter.use(requireAuth, requireRole('SELLER', 'ADMIN'));

categoriesRouter.get('/', asyncHandler(controller.listCategoriesHandler));

categoriesRouter.post(
  '/',
  validate({ body: createCategorySchema }),
  asyncHandler(controller.createCategoryHandler),
);

categoriesRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.getCategoryHandler),
);

categoriesRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(controller.updateCategoryHandler),
);

categoriesRouter.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteCategoryHandler),
);
