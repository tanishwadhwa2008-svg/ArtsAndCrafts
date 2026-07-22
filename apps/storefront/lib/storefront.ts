import { env } from './env';

/**
 * Server-side data client for the public storefront API. Fetches run in React
 * Server Components with `no-store`, so every request reflects the current
 * catalogue (in sync with inventory, images, and publish state). Returns `null`
 * on any failure so pages can degrade gracefully / call notFound().
 */

export interface ProductCard {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string | null;
  inStock: boolean;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ProductDetail extends ProductCard {
  description: string | null;
  category: { name: string; slug: string } | null;
  images: ProductImage[];
}

export interface CollectionCard {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  productCount: number;
}

export interface CollectionDetail extends Omit<CollectionCard, 'productCount'> {
  products: ProductCard[];
}

export interface HomeFeed {
  collections: CollectionCard[];
  products: ProductCard[];
}

export interface ContactInfo {
  phone: string | null;
  email: string | null;
  location: string | null;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/public${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean; data?: T };
    return body?.data ?? null;
  } catch {
    return null;
  }
}

export function getHomeFeed(): Promise<HomeFeed | null> {
  return getJson<HomeFeed>('/home');
}

export function getProducts(params: { search?: string; limit?: number } = {}): Promise<
  ProductCard[] | null
> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.limit) q.set('limit', String(params.limit));
  const s = q.toString();
  return getJson<ProductCard[]>(`/products${s ? `?${s}` : ''}`);
}

export function getProduct(slug: string): Promise<ProductDetail | null> {
  return getJson<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export function getCollections(): Promise<CollectionCard[] | null> {
  return getJson<CollectionCard[]>('/collections');
}

export function getCollection(slug: string): Promise<CollectionDetail | null> {
  return getJson<CollectionDetail>(`/collections/${encodeURIComponent(slug)}`);
}

export function getContact(): Promise<ContactInfo | null> {
  return getJson<ContactInfo>('/contact');
}
