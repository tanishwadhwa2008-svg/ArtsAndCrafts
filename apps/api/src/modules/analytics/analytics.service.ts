import type { AnalyticsSummary, CategoryProductCount, ProductsByStatus } from '@arts/shared';
import { prisma } from '../../db/prisma.js';
import { serializeMoney } from '../../lib/money.js';

interface InventoryAggregateRow {
  currency: string;
  units: bigint | number | null;
  value: string | number | null;
}

interface CountRow {
  count: bigint | number | null;
}

function toNumber(value: string | bigint | number | null | undefined): number {
  return value == null ? 0 : Number(value);
}

/**
 * Computes the aggregate dashboard metrics for a single shop. Everything is
 * scoped to `shopId` and excludes soft-deleted products/categories, so one
 * seller can never see another's figures (OWASP A01).
 */
export async function getAnalyticsSummary(shopId: string): Promise<AnalyticsSummary> {
  const productWhere = { shopId, deletedAt: null };

  const [
    productsTotal,
    statusGroups,
    categoriesTotal,
    variantsTotal,
    categoryGroups,
    categories,
    inventoryRows,
    lowStockRows,
  ] = await Promise.all([
    prisma.product.count({ where: productWhere }),
    prisma.product.groupBy({ by: ['status'], where: productWhere, _count: { _all: true } }),
    prisma.category.count({ where: { shopId, deletedAt: null } }),
    prisma.productVariant.count({ where: { product: productWhere } }),
    prisma.product.groupBy({ by: ['categoryId'], where: productWhere, _count: { _all: true } }),
    prisma.category.findMany({
      where: { shopId, deletedAt: null },
      select: { id: true, name: true },
    }),
    // Units + value grouped by currency. Stock is valued at the product's
    // base price — the same figure shown on the storefront — so the dashboard
    // total stays consistent with catalog pricing.
    prisma.$queryRaw<InventoryAggregateRow[]>`
      SELECT p.currency AS currency,
             COALESCE(SUM(i.quantity), 0) AS units,
             COALESCE(SUM(i.quantity * p."basePrice"), 0) AS value
      FROM inventory i
      JOIN product_variants v ON v.id = i."variantId"
      JOIN products p ON p.id = v."productId"
      WHERE p."shopId" = ${shopId}
        AND p."deletedAt" IS NULL
      GROUP BY p.currency
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) AS count
      FROM inventory i
      JOIN product_variants v ON v.id = i."variantId"
      JOIN products p ON p.id = v."productId"
      WHERE p."shopId" = ${shopId}
        AND p."deletedAt" IS NULL
        AND i.quantity <= i."lowStockThreshold"
    `,
  ]);

  const byStatus: ProductsByStatus = { DRAFT: 0, ACTIVE: 0, ARCHIVED: 0 };
  for (const group of statusGroups) {
    byStatus[group.status] = group._count._all;
  }

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const productsByCategory: CategoryProductCount[] = categoryGroups
    .map((group) => ({
      categoryId: group.categoryId,
      name: group.categoryId
        ? (categoryNameById.get(group.categoryId) ?? 'Unknown')
        : 'Uncategorized',
      productCount: group._count._all,
    }))
    .sort((a, b) => b.productCount - a.productCount);

  const totalUnits = inventoryRows.reduce((sum, row) => sum + toNumber(row.units), 0);
  const valueByCurrency = inventoryRows
    .filter((row) => toNumber(row.value) > 0 || toNumber(row.units) > 0)
    .map((row) => ({ currency: row.currency, value: serializeMoney(row.value ?? 0) }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  return {
    products: { total: productsTotal, byStatus },
    categories: { total: categoriesTotal },
    variants: { total: variantsTotal },
    inventory: {
      totalUnits,
      lowStockCount: toNumber(lowStockRows[0]?.count),
      valueByCurrency,
    },
    productsByCategory,
  };
}
