import type { Prisma } from '@prisma/client';
import type { AdjustInventoryInput, InventoryListQuery } from '@arts/shared';
import { prisma } from '../../db/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/errors.js';
import { toSkipTake } from '../../lib/pagination.js';

/** Inventory row joined with its variant and parent product. */
export const inventoryInclude = {
  variant: { include: { product: { select: { id: true, title: true } } } },
} satisfies Prisma.InventoryInclude;

export type InventoryWithContext = Prisma.InventoryGetPayload<{ include: typeof inventoryInclude }>;

async function getOwnedInventory(shopId: string, variantId: string): Promise<InventoryWithContext> {
  const inventory = await prisma.inventory.findFirst({
    where: { variantId, variant: { product: { shopId, deletedAt: null } } },
    include: inventoryInclude,
  });
  if (!inventory) {
    throw new NotFoundError('Inventory not found for this variant');
  }
  return inventory;
}

export async function listInventory(
  shopId: string,
  query: InventoryListQuery,
): Promise<{ items: InventoryWithContext[]; total: number }> {
  const base: Prisma.InventoryWhereInput = {
    variant: { product: { shopId, deletedAt: null } },
  };

  let where = base;
  if (query.lowStockOnly) {
    // Column-to-column comparison isn't expressible in the Prisma query API,
    // so pre-select the low-stock ids with a scoped raw query.
    const lowStock = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT i.id
      FROM inventory i
      JOIN product_variants v ON v.id = i."variantId"
      JOIN products p ON p.id = v."productId"
      WHERE p."shopId" = ${shopId}
        AND p."deletedAt" IS NULL
        AND i.quantity <= i."lowStockThreshold"
    `;
    where = { id: { in: lowStock.map((row) => row.id) } };
  }

  const { skip, take } = toSkipTake(query.page, query.pageSize);
  const [items, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      where,
      include: inventoryInclude,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    }),
    prisma.inventory.count({ where }),
  ]);

  return { items, total };
}

export async function adjustInventory(
  shopId: string,
  variantId: string,
  input: AdjustInventoryInput,
): Promise<InventoryWithContext> {
  const current = await getOwnedInventory(shopId, variantId);

  let nextQuantity = current.quantity;
  if (input.setQuantity !== undefined) {
    nextQuantity = input.setQuantity;
  } else if (input.adjustBy !== undefined) {
    nextQuantity = current.quantity + input.adjustBy;
  }

  if (nextQuantity < 0) {
    throw new BadRequestError('Resulting quantity cannot be negative');
  }

  const data: Prisma.InventoryUpdateManyMutationInput = {
    quantity: nextQuantity,
    version: { increment: 1 },
    ...(input.lowStockThreshold !== undefined
      ? { lowStockThreshold: input.lowStockThreshold }
      : {}),
  };

  // Optimistic concurrency: only update if the version still matches.
  if (input.expectedVersion !== undefined) {
    const result = await prisma.inventory.updateMany({
      where: { id: current.id, version: input.expectedVersion },
      data,
    });
    if (result.count === 0) {
      throw new ConflictError('Inventory was modified by another request (version mismatch)');
    }
  } else {
    await prisma.inventory.update({ where: { id: current.id }, data });
  }

  return getOwnedInventory(shopId, variantId);
}
