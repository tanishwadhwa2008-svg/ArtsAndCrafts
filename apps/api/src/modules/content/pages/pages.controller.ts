import type { Request, Response } from 'express';
import type {
  ApiSuccess,
  ContentBlockInput,
  ContentPageListQuery,
  CreateContentPageInput,
  ReorderBlocksInput,
  UpdateContentPageInput,
} from '@arts/shared';
import { requireShopId } from '../../../lib/shop-scope.js';
import * as pagesService from './pages.service.js';
import {
  serializeContentPage,
  serializeContentPageListItem,
  type ContentPageDto,
  type ContentPageListItemDto,
} from './pages.serializer.js';

export async function listContentPagesHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const query = req.validated.query as ContentPageListQuery;
  const pages = await pagesService.listContentPages(shopId, query);
  const body: ApiSuccess<ContentPageListItemDto[]> = {
    ok: true,
    data: pages.map(serializeContentPageListItem),
  };
  res.json(body);
}

export async function getHomeHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const page = await pagesService.getOrCreateHome(shopId);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.json(body);
}

export async function getContentPageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const page = await pagesService.getContentPage(shopId, id);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.json(body);
}

export async function createContentPageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const input = req.validated.body as CreateContentPageInput;
  const page = await pagesService.createContentPage(shopId, input);
  const detail = await pagesService.getContentPage(shopId, page.id);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(detail) };
  res.status(201).json(body);
}

export async function updateContentPageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as UpdateContentPageInput;
  await pagesService.updateContentPage(shopId, id, input);
  const detail = await pagesService.getContentPage(shopId, id);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(detail) };
  res.json(body);
}

export async function deleteContentPageHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  await pagesService.deleteContentPage(shopId, id);
  res.status(204).send();
}

export async function addBlockHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as ContentBlockInput;
  const page = await pagesService.addBlock(shopId, id, input);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.status(201).json(body);
}

export async function updateBlockHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id, blockId } = req.validated.params as { id: string; blockId: string };
  const input = req.validated.body as ContentBlockInput;
  const page = await pagesService.updateBlock(shopId, id, blockId, input);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.json(body);
}

export async function deleteBlockHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id, blockId } = req.validated.params as { id: string; blockId: string };
  const page = await pagesService.deleteBlock(shopId, id, blockId);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.json(body);
}

export async function reorderBlocksHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as ReorderBlocksInput;
  const page = await pagesService.reorderBlocks(shopId, id, input.blockIds);
  const body: ApiSuccess<ContentPageDto> = { ok: true, data: serializeContentPage(page) };
  res.json(body);
}
