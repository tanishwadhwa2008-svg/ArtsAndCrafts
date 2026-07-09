import type { ContentBlock } from '@prisma/client';
import type { ContentPageDetailRow, ContentPageListRow } from './pages.service.js';

export interface ContentBlockDto {
  id: string;
  type: string;
  payload: unknown;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPageListItemDto {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  blockCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPageDto {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blocks: ContentBlockDto[];
}

export function serializeContentBlock(block: ContentBlock): ContentBlockDto {
  return {
    id: block.id,
    type: block.type,
    payload: block.payload,
    position: block.position,
    createdAt: block.createdAt.toISOString(),
    updatedAt: block.updatedAt.toISOString(),
  };
}

export function serializeContentPageListItem(page: ContentPageListRow): ContentPageListItemDto {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    type: page.type,
    status: page.status,
    blockCount: page._count.blocks,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };
}

export function serializeContentPage(page: ContentPageDetailRow): ContentPageDto {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    type: page.type,
    status: page.status,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    publishedAt: page.publishedAt?.toISOString() ?? null,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
    blocks: page.blocks.map(serializeContentBlock),
  };
}
