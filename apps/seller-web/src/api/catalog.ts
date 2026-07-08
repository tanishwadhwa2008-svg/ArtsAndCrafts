import type {
  AdjustInventoryInput,
  AttachImageInput,
  CreateCategoryInput,
  CreateProductInput,
  CreateVariantInput,
  Paginated,
  UpdateCategoryInput,
  UpdateImageInput,
  UpdateProductInput,
  UpdateVariantInput,
  UploadUrlInput,
} from '@arts/shared';
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

// --- Products ---

export function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`);
}

export function createProduct(body: CreateProductInput): Promise<Product> {
  return apiRequest<Product>('/products', { method: 'POST', body });
}

export function updateProduct(id: string, body: UpdateProductInput): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body });
}

export function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
}

// --- Variants ---

export function addVariant(productId: string, body: CreateVariantInput): Promise<Variant> {
  return apiRequest<Variant>(`/products/${productId}/variants`, { method: 'POST', body });
}

export function updateVariant(variantId: string, body: UpdateVariantInput): Promise<Variant> {
  return apiRequest<Variant>(`/products/variants/${variantId}`, { method: 'PATCH', body });
}

export function deleteVariant(variantId: string): Promise<void> {
  return apiRequest<void>(`/products/variants/${variantId}`, { method: 'DELETE' });
}

// --- Images ---

export function addImage(productId: string, body: AttachImageInput): Promise<ProductImage> {
  return apiRequest<ProductImage>(`/products/${productId}/images`, { method: 'POST', body });
}

export function setPrimaryImage(imageId: string): Promise<ProductImage> {
  return apiRequest<ProductImage>(`/products/images/${imageId}`, {
    method: 'PATCH',
    body: { isPrimary: true },
  });
}

export function updateImage(imageId: string, body: UpdateImageInput): Promise<ProductImage> {
  return apiRequest<ProductImage>(`/products/images/${imageId}`, { method: 'PATCH', body });
}

export function deleteImage(imageId: string): Promise<void> {
  return apiRequest<void>(`/products/images/${imageId}`, { method: 'DELETE' });
}

// --- Categories ---

export function createCategory(body: CreateCategoryInput): Promise<Category> {
  return apiRequest<Category>('/categories', { method: 'POST', body });
}

export function updateCategory(id: string, body: UpdateCategoryInput): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}`, { method: 'PATCH', body });
}

export function deleteCategory(id: string): Promise<void> {
  return apiRequest<void>(`/categories/${id}`, { method: 'DELETE' });
}

// --- Inventory ---

export function adjustInventory(
  variantId: string,
  body: AdjustInventoryInput,
): Promise<InventoryItem> {
  return apiRequest<InventoryItem>(`/inventory/${variantId}`, { method: 'PATCH', body });
}

// --- Media ---

export interface UploadTarget {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
  expiresIn: number;
}

export function requestUploadUrl(body: UploadUrlInput): Promise<UploadTarget> {
  return apiRequest<UploadTarget>('/media/upload-url', { method: 'POST', body });
}

/** Uploads the raw file bytes directly to object storage via the presigned URL. */
export async function uploadToStorage(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error('File upload failed');
  }
}
