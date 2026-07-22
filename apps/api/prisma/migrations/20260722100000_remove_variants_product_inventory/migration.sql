-- Remove product variants; move inventory to the product level.
--
-- Data-preserving migration: aggregates each product's variant stock into a
-- single product-level inventory row, backfills `products.sku` from each
-- product's first variant, and gives variant-less products an empty inventory
-- row. A full backup was taken to devops/db-backups/arts_pre_variants.sql first.

-- 1) New columns (nullable while we backfill).
ALTER TABLE "products" ADD COLUMN "sku" TEXT;
ALTER TABLE "inventory" ADD COLUMN "productId" TEXT;

-- 2) products.sku <- each product's first (oldest) variant SKU.
UPDATE "products" p
SET "sku" = v."sku"
FROM (
  SELECT DISTINCT ON ("productId") "productId", "sku"
  FROM "product_variants"
  ORDER BY "productId", "createdAt" ASC
) v
WHERE v."productId" = p."id";

-- 3) Point each existing inventory row at its variant's product.
UPDATE "inventory" i
SET "productId" = v."productId"
FROM "product_variants" v
WHERE v."id" = i."variantId";

-- 4) Collapse to exactly one inventory row per product: aggregate stock (sum
--    quantity/reserved, min threshold), then rebuild the table. Products with
--    no variant get a zeroed row.
CREATE TEMP TABLE "_inv_agg" AS
SELECT p."id" AS product_id,
       COALESCE(SUM(i."quantity"), 0)::int AS quantity,
       COALESCE(SUM(i."reserved"), 0)::int AS reserved,
       COALESCE(MIN(i."lowStockThreshold"), 5)::int AS threshold
FROM "products" p
LEFT JOIN "inventory" i ON i."productId" = p."id"
GROUP BY p."id";

-- 5) Drop the variant plumbing BEFORE rebuilding inventory rows, so the old
--    NOT NULL "variantId" column is gone when we re-insert.
ALTER TABLE "inventory" DROP CONSTRAINT IF EXISTS "inventory_variantId_fkey";
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_variantId_fkey";
ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "product_variants_productId_fkey";
DROP INDEX IF EXISTS "inventory_variantId_key";
ALTER TABLE "inventory" DROP COLUMN "variantId";
ALTER TABLE "order_items" DROP COLUMN "variantId";
DROP TABLE "product_variants";

-- 6) Rebuild inventory: exactly one row per product from the aggregate.
DELETE FROM "inventory";

INSERT INTO "inventory" ("id", "productId", "quantity", "reserved", "lowStockThreshold", "version", "updatedAt")
SELECT gen_random_uuid()::text, product_id, quantity, reserved, threshold, 0, now()
FROM "_inv_agg";

DROP TABLE "_inv_agg";

-- 7) Enforce the product-level inventory shape.
ALTER TABLE "inventory" ALTER COLUMN "productId" SET NOT NULL;
CREATE UNIQUE INDEX "inventory_productId_key" ON "inventory"("productId");
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
