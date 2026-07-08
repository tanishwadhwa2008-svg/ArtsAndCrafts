import type { Request, Response } from 'express';
import type { AdjustInventoryInput, ApiSuccess, InventoryListQuery, Paginated } from '@arts/shared';
import { requireShopId } from '../../lib/shop-scope.js';
import { buildPaginationMeta } from '../../lib/pagination.js';
import * as inventoryService from './inventory.service.js';
import { serializeInventoryItem, type InventoryItemDto } from './inventory.serializer.js';

export async function listInventoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const query = req.validated.query as InventoryListQuery;
  const { items, total } = await inventoryService.listInventory(shopId, query);

  const body: ApiSuccess<Paginated<InventoryItemDto>> = {
    ok: true,
    data: {
      items: items.map(serializeInventoryItem),
      meta: buildPaginationMeta(query.page, query.pageSize, total),
    },
  };
  res.json(body);
}

export async function adjustInventoryHandler(req: Request, res: Response): Promise<void> {
  const shopId = requireShopId(req);
  const { id } = req.validated.params as { id: string };
  const input = req.validated.body as AdjustInventoryInput;
  const inventory = await inventoryService.adjustInventory(shopId, id, input);

  const body: ApiSuccess<InventoryItemDto> = {
    ok: true,
    data: serializeInventoryItem(inventory),
  };
  res.json(body);
}
