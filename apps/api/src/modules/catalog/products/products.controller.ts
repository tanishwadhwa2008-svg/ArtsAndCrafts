import type { Request, Response } from 'express';
import type {
  ApiSuccess,
  AttachImageInput,
  CreateProductInput,
  Paginated,
  ProductListQuery,
  UpdateImageInput,
  UpdateProductInput,
} from '@arts/shared';
import { requireShopId } from '../../../lib/shop-scope.js';
import { buildPaginationMeta } from '../../../lib/pagination.js';
import * as productsService from './products.service.js';
import {
  serializeImage,
  serializeProduct,
  type ImageDto,
  type ProductDto,
} from './products.serializer.js';

export async function listProductsHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const query = req.validated.query as ProductListQuery;
  const { items, total } = await productsService.listProducts(shopId, query);

  const body: ApiSuccess<Paginated<ProductDto>> = {
    ok: true,
    data: {
      items: items.map(serializeProduct),
      meta: buildPaginationMeta(query.page, query.pageSize, total),
    },
  };
  res.json(body);
}

export async function getProductHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const product = await productsService.getProduct(shopId, id);
  const body: ApiSuccess<ProductDto> = { ok: true, data: serializeProduct(product) };
  res.json(body);
}

export async function createProductHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as CreateProductInput;
  const product = await productsService.createProduct(shopId, input);
  const body: ApiSuccess<ProductDto> = { ok: true, data: serializeProduct(product) };
  res.status(201).json(body);
}

export async function updateProductHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as UpdateProductInput;
  const product = await productsService.updateProduct(shopId, id, input);
  const body: ApiSuccess<ProductDto> = { ok: true, data: serializeProduct(product) };
  res.json(body);
}

export async function deleteProductHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  await productsService.deleteProduct(shopId, id);
  res.status(204).send();
}

// --- Images ---

export async function createImageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as AttachImageInput;
  const image = await productsService.addImage(shopId, id, input);
  const body: ApiSuccess<ImageDto> = { ok: true, data: serializeImage(image) };
  res.status(201).json(body);
}

export async function updateImageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as UpdateImageInput;
  const image = await productsService.updateImage(shopId, id, input);
  const body: ApiSuccess<ImageDto> = { ok: true, data: serializeImage(image) };
  res.json(body);
}

export async function deleteImageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  await productsService.deleteImage(shopId, id);
  res.status(204).send();
}
