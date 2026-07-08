import { Prisma, type ProductImage, type ProductVariant } from '@prisma/client';
import type {
  AttachImageInput,
  CreateProductInput,
  CreateVariantInput,
  ProductListQuery,
  UpdateImageInput,
  UpdateProductInput,
  UpdateVariantInput,
} from '@arts/shared';
import { prisma } from '../../../db/prisma.js';
import { NotFoundError } from '../../../lib/errors.js';
import { toSkipTake } from '../../../lib/pagination.js';

/** Relations always loaded with a product for the seller portal. */
export const productInclude = {
  variants: { include: { inventory: true }, orderBy: { createdAt: 'asc' } },
  images: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

async function assertCategory(shopId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, shopId, deletedAt: null },
    select: { id: true },
  });
  if (!category) {
    throw new NotFoundError('Category not found');
  }
}

export async function listProducts(
  shopId: string,
  query: ProductListQuery,
): Promise<{ items: ProductWithRelations[]; total: number }> {
  const where: Prisma.ProductWhereInput = {
    shopId,
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.search ? { title: { contains: query.search, mode: 'insensitive' as const } } : {}),
  };

  const { skip, take } = toSkipTake(query.page, query.pageSize);
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

export async function getProduct(shopId: string, id: string): Promise<ProductWithRelations> {
  const product = await prisma.product.findFirst({
    where: { id, shopId, deletedAt: null },
    include: productInclude,
  });
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export async function createProduct(
  shopId: string,
  input: CreateProductInput,
): Promise<ProductWithRelations> {
  if (input.categoryId) {
    await assertCategory(shopId, input.categoryId);
  }
  return prisma.product.create({
    data: {
      shopId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      status: input.status,
      basePrice: new Prisma.Decimal(input.basePrice),
      currency: input.currency,
      categoryId: input.categoryId,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
    },
    include: productInclude,
  });
}

export async function updateProduct(
  shopId: string,
  id: string,
  input: UpdateProductInput,
): Promise<ProductWithRelations> {
  await getProduct(shopId, id);
  if (input.categoryId) {
    await assertCategory(shopId, input.categoryId);
  }

  return prisma.product.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      status: input.status,
      basePrice: input.basePrice !== undefined ? new Prisma.Decimal(input.basePrice) : undefined,
      currency: input.currency,
      categoryId: input.categoryId,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
    },
    include: productInclude,
  });
}

export async function deleteProduct(shopId: string, id: string): Promise<void> {
  await getProduct(shopId, id);
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
}

// --- Variants ---

export type VariantWithInventory = Prisma.ProductVariantGetPayload<{
  include: { inventory: true };
}>;

async function getOwnedVariant(shopId: string, variantId: string): Promise<ProductVariant> {
  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { shopId, deletedAt: null } },
  });
  if (!variant) {
    throw new NotFoundError('Variant not found');
  }
  return variant;
}

export async function addVariant(
  shopId: string,
  productId: string,
  input: CreateVariantInput,
): Promise<VariantWithInventory> {
  await getProduct(shopId, productId);
  return prisma.productVariant.create({
    data: {
      productId,
      sku: input.sku,
      name: input.name,
      price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
      attributes: input.attributes,
      isActive: input.isActive,
      // Every variant gets an inventory row so stock can be tracked immediately.
      inventory: { create: {} },
    },
    include: { inventory: true },
  });
}

export async function updateVariant(
  shopId: string,
  variantId: string,
  input: UpdateVariantInput,
): Promise<VariantWithInventory> {
  await getOwnedVariant(shopId, variantId);
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku: input.sku,
      name: input.name,
      price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
      attributes: input.attributes,
      isActive: input.isActive,
    },
    include: { inventory: true },
  });
}

export async function deleteVariant(shopId: string, variantId: string): Promise<void> {
  await getOwnedVariant(shopId, variantId);
  await prisma.productVariant.delete({ where: { id: variantId } });
}

// --- Images ---

async function getOwnedImage(shopId: string, imageId: string): Promise<ProductImage> {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, product: { shopId, deletedAt: null } },
  });
  if (!image) {
    throw new NotFoundError('Image not found');
  }
  return image;
}

export async function addImage(
  shopId: string,
  productId: string,
  input: AttachImageInput,
): Promise<ProductImage> {
  await getProduct(shopId, productId);

  return prisma.$transaction(async (tx) => {
    if (input.isPrimary) {
      await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }
    return tx.productImage.create({
      data: {
        productId,
        storageKey: input.storageKey,
        url: input.url,
        altText: input.altText,
        position: input.position,
        isPrimary: input.isPrimary,
      },
    });
  });
}

export async function updateImage(
  shopId: string,
  imageId: string,
  input: UpdateImageInput,
): Promise<ProductImage> {
  const image = await getOwnedImage(shopId, imageId);

  return prisma.$transaction(async (tx) => {
    if (input.isPrimary === true) {
      await tx.productImage.updateMany({
        where: { productId: image.productId },
        data: { isPrimary: false },
      });
    }
    return tx.productImage.update({
      where: { id: imageId },
      data: {
        altText: input.altText,
        position: input.position,
        isPrimary: input.isPrimary,
      },
    });
  });
}

export async function deleteImage(shopId: string, imageId: string): Promise<void> {
  await getOwnedImage(shopId, imageId);
  await prisma.productImage.delete({ where: { id: imageId } });
}
