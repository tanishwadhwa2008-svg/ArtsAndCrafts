-- Add optional intrinsic pixel dimensions to product images so the storefront
-- and seller editor can render them at their native aspect ratio. Nullable so
-- existing rows are untouched (no backfill required).
ALTER TABLE "product_images" ADD COLUMN "width" INTEGER;
ALTER TABLE "product_images" ADD COLUMN "height" INTEGER;
