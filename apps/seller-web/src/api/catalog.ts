import type { Paginated } from '@arts/shared';
import { apiRequest } from '../lib/api.js';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryInfo {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  version: number;
}

export interface Variant {
  id: string;
  sku: string;
  name: string;
  price: string | null;
  attributes: unknown;
  isActive: boolean;
  inventory: InventoryInfo | null;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  basePrice: string;
  currency: string;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
  images: ProductImage[];
}

export interface InventoryItem {
  variantId: string;
  sku: string;
  variantName: string;
  productId: string;
  productTitle: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  version: number;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: Product['status'];
}

function query(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function listProducts(params: ProductListParams = {}): Promise<Paginated<Product>> {
  return apiRequest<Paginated<Product>>(
    `/products${query({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
    })}`,
  );
}

export function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

export function listInventory(params: {
  page?: number;
  pageSize?: number;
  lowStockOnly?: boolean;
}): Promise<Paginated<InventoryItem>> {
  return apiRequest<Paginated<InventoryItem>>(
    `/inventory${query({ page: params.page, pageSize: params.pageSize, lowStockOnly: params.lowStockOnly ? 'true' : undefined })}`,
  );
}
