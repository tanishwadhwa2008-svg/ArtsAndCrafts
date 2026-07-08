import type { Category } from '@prisma/client';
import type { CreateCategoryInput, UpdateCategoryInput } from '@arts/shared';
import { prisma } from '../../../db/prisma.js';
import { BadRequestError, NotFoundError } from '../../../lib/errors.js';

/**
 * Category service. Every query is scoped to `shopId` and excludes
 * soft-deleted rows so a shop can only ever see and mutate its own catalog.
 */

export function listCategories(shopId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { shopId, deletedAt: null },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
  });
}

export async function getCategory(shopId: string, id: string): Promise<Category> {
  const category = await prisma.category.findFirst({
    where: { id, shopId, deletedAt: null },
  });
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  return category;
}

async function assertParentExists(shopId: string, parentId: string): Promise<void> {
  const parent = await prisma.category.findFirst({
    where: { id: parentId, shopId, deletedAt: null },
    select: { id: true },
  });
  if (!parent) {
    throw new NotFoundError('Parent category not found');
  }
}

export async function createCategory(
  shopId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  if (input.parentId) {
    await assertParentExists(shopId, input.parentId);
  }
  return prisma.category.create({
    data: {
      shopId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      parentId: input.parentId,
      position: input.position,
    },
  });
}

export async function updateCategory(
  shopId: string,
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  await getCategory(shopId, id);

  if (input.parentId !== undefined && input.parentId !== null) {
    if (input.parentId === id) {
      throw new BadRequestError('A category cannot be its own parent');
    }
    await assertParentExists(shopId, input.parentId);
  }

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      parentId: input.parentId,
      position: input.position,
    },
  });
}

export async function deleteCategory(shopId: string, id: string): Promise<void> {
  await getCategory(shopId, id);
  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
