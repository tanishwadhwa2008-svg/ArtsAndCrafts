import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@arts/shared';
import { apiRequest } from '../lib/api.js';

export interface CollectionListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverStorageKey: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  position: number;
  productCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionProduct {
  productId: string;
  position: number;
  title: string;
  slug: string;
  status: string;
  imageUrl: string | null;
}

export interface CollectionDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverStorageKey: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  position: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  products: CollectionProduct[];
}

export interface CollectionListParams {
  status?: 'DRAFT' | 'PUBLISHED';
  search?: string;
}

function query(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function listCollections(params: CollectionListParams = {}): Promise<CollectionListItem[]> {
  return apiRequest<CollectionListItem[]>(
    `/collections${query({ status: params.status, search: params.search })}`,
  );
}

export function getCollection(id: string): Promise<CollectionDetail> {
  return apiRequest<CollectionDetail>(`/collections/${id}`);
}

export function createCollection(body: CreateCollectionInput): Promise<CollectionDetail> {
  return apiRequest<CollectionDetail>('/collections', { method: 'POST', body });
}

export function updateCollection(id: string, body: UpdateCollectionInput): Promise<CollectionDetail> {
  return apiRequest<CollectionDetail>(`/collections/${id}`, { method: 'PATCH', body });
}

export function deleteCollection(id: string): Promise<void> {
  return apiRequest<void>(`/collections/${id}`, { method: 'DELETE' });
}

export function setCollectionProducts(id: string, productIds: string[]): Promise<CollectionDetail> {
  return apiRequest<CollectionDetail>(`/collections/${id}/products`, {
    method: 'PUT',
    body: { productIds },
  });
}
