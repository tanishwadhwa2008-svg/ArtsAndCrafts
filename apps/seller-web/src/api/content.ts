import type {
  ContentBlockInput,
  CreateContentPageInput,
  UpdateContentPageInput,
} from '@arts/shared';
import { apiRequest } from '../lib/api.js';

export interface ContentBlock {
  id: string;
  type: string;
  payload: unknown;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPage {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED';
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blocks: ContentBlock[];
}

export interface ContentPageListItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED';
  blockCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function getHome(): Promise<ContentPage> {
  return apiRequest<ContentPage>('/content/home');
}

export function listContentPages(
  params: { type?: string; status?: string } = {},
): Promise<ContentPageListItem[]> {
  const q = new URLSearchParams();
  if (params.type) q.set('type', params.type);
  if (params.status) q.set('status', params.status);
  const s = q.toString();
  return apiRequest<ContentPageListItem[]>(`/content/pages${s ? `?${s}` : ''}`);
}

export function getContentPage(id: string): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${id}`);
}

export function createContentPage(body: CreateContentPageInput): Promise<ContentPage> {
  return apiRequest<ContentPage>('/content/pages', { method: 'POST', body });
}

export function deleteContentPage(id: string): Promise<void> {
  return apiRequest<void>(`/content/pages/${id}`, { method: 'DELETE' });
}

export function updateContentPage(id: string, body: UpdateContentPageInput): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${id}`, { method: 'PATCH', body });
}

export function addBlock(pageId: string, body: ContentBlockInput): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${pageId}/blocks`, { method: 'POST', body });
}

export function updateBlock(
  pageId: string,
  blockId: string,
  body: ContentBlockInput,
): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${pageId}/blocks/${blockId}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteBlock(pageId: string, blockId: string): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${pageId}/blocks/${blockId}`, { method: 'DELETE' });
}

export function reorderBlocks(pageId: string, blockIds: string[]): Promise<ContentPage> {
  return apiRequest<ContentPage>(`/content/pages/${pageId}/blocks/order`, {
    method: 'PUT',
    body: { blockIds },
  });
}
