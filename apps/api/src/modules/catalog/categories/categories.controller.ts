import type { Request, Response } from 'express';
import type { ApiSuccess, CreateCategoryInput, UpdateCategoryInput } from '@arts/shared';
import { requireShopId } from '../../../lib/shop-scope.js';
import * as categoriesService from './categories.service.js';
import { serializeCategory, type CategoryDto } from './categories.serializer.js';

export async function listCategoriesHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const categories = await categoriesService.listCategories(shopId);
  const body: ApiSuccess<CategoryDto[]> = { ok: true, data: categories.map(serializeCategory) };
  res.json(body);
}

export async function getCategoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const category = await categoriesService.getCategory(shopId, id);
  const body: ApiSuccess<CategoryDto> = { ok: true, data: serializeCategory(category) };
  res.json(body);
}

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as CreateCategoryInput;
  const category = await categoriesService.createCategory(shopId, input);
  const body: ApiSuccess<CategoryDto> = { ok: true, data: serializeCategory(category) };
  res.status(201).json(body);
}

export async function updateCategoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as UpdateCategoryInput;
  const category = await categoriesService.updateCategory(shopId, id, input);
  const body: ApiSuccess<CategoryDto> = { ok: true, data: serializeCategory(category) };
  res.json(body);
}

export async function deleteCategoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  await categoriesService.deleteCategory(shopId, id);
  res.status(204).send();
}
