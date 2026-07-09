import type { Request, Response } from 'express';
import type { ApiSuccess } from '@arts/shared';
import * as publicService from './public.service.js';
import {
  serializePublicCollectionCard,
  serializePublicCollectionDetail,
  serializePublicContact,
  serializePublicProductCard,
  serializePublicProductDetail,
  type PublicCollectionCardDto,
  type PublicCollectionDetailDto,
  type PublicContactDto,
  type PublicProductCardDto,
  type PublicProductDetailDto,
} from './public.serializer.js';

export async function homeHandler(_req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const { collections, products } = await publicService.getPublicHome(shopId);
  const body: ApiSuccess<{
    collections: PublicCollectionCardDto[];
    products: PublicProductCardDto[];
  }> = {
    ok: true,
    data: {
      collections: collections.map(serializePublicCollectionCard),
      products: products.map(serializePublicProductCard),
    },
  };
  res.json(body);
}

export async function listProductsHandler(req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const query = req.validated.query as { search?: string; limit?: number };
  const products = await publicService.listPublicProducts(shopId, query);
  const body: ApiSuccess<PublicProductCardDto[]> = {
    ok: true,
    data: products.map(serializePublicProductCard),
  };
  res.json(body);
}

export async function productBySlugHandler(req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const { slug } = req.validated.params as { slug: string };
  const product = await publicService.getPublicProductBySlug(shopId, slug);
  const body: ApiSuccess<PublicProductDetailDto> = {
    ok: true,
    data: serializePublicProductDetail(product),
  };
  res.json(body);
}

export async function listCollectionsHandler(_req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const collections = await publicService.listPublicCollections(shopId);
  const body: ApiSuccess<PublicCollectionCardDto[]> = {
    ok: true,
    data: collections.map(serializePublicCollectionCard),
  };
  res.json(body);
}

export async function collectionBySlugHandler(req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const { slug } = req.validated.params as { slug: string };
  const collection = await publicService.getPublicCollectionBySlug(shopId, slug);
  const body: ApiSuccess<PublicCollectionDetailDto> = {
    ok: true,
    data: serializePublicCollectionDetail(collection),
  };
  res.json(body);
}

export async function contactHandler(_req: Request, res: Response): Promise<void> {
  const shopId = await publicService.resolvePublicShopId();
  const contact = await publicService.getPublicContact(shopId);
  const body: ApiSuccess<PublicContactDto> = {
    ok: true,
    data: serializePublicContact(contact),
  };
  res.json(body);
}
