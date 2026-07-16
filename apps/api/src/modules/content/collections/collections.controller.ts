import type { Request, Response } from 'express';
import type {
  AiCommitInput,
  ApiSuccess,
  CollectionListQuery,
  CreateCollectionInput,
  SetCollectionProductsInput,
  UpdateCollectionInput,
} from '@arts/shared';
import { requireShopId } from '../../../lib/shop-scope.js';
import * as collectionsService from './collections.service.js';
import {
  serializeCollectionDetail,
  serializeCollectionListItem,
  type CollectionDetailDto,
  type CollectionListItemDto,
} from './collections.serializer.js';

export async function listCollectionsHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const query = req.validated.query as CollectionListQuery;
  const collections = await collectionsService.listCollections(shopId, query);
  const body: ApiSuccess<CollectionListItemDto[]> = {
    ok: true,
    data: collections.map(serializeCollectionListItem),
  };
  res.json(body);
}

export async function getCollectionHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const collection = await collectionsService.getCollection(shopId, id);
  const body: ApiSuccess<CollectionDetailDto> = {
    ok: true,
    data: serializeCollectionDetail(collection),
  };
  res.json(body);
}

export async function createCollectionHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as CreateCollectionInput;
  const collection = await collectionsService.createCollection(shopId, input);
  const detail = await collectionsService.getCollection(shopId, collection.id);
  const body: ApiSuccess<CollectionDetailDto> = {
    ok: true,
    data: serializeCollectionDetail(detail),
  };
  res.status(201).json(body);
}

export async function updateCollectionHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as UpdateCollectionInput;
  await collectionsService.updateCollection(shopId, id, input);
  const detail = await collectionsService.getCollection(shopId, id);
  const body: ApiSuccess<CollectionDetailDto> = {
    ok: true,
    data: serializeCollectionDetail(detail),
  };
  res.json(body);
}

export async function deleteCollectionHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  await collectionsService.deleteCollection(shopId, id);
  res.status(204).send();
}

export async function setCollectionProductsHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as SetCollectionProductsInput;
  const collection = await collectionsService.setCollectionProducts(shopId, id, input.productIds);
  const body: ApiSuccess<CollectionDetailDto> = {
    ok: true,
    data: serializeCollectionDetail(collection),
  };
  res.json(body);
}

export async function aiCommitHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as AiCommitInput;
  const collection = await collectionsService.commitAiCollection(shopId, input);
  const body: ApiSuccess<CollectionDetailDto> = {
    ok: true,
    data: serializeCollectionDetail(collection),
  };
  res.status(201).json(body);
}
