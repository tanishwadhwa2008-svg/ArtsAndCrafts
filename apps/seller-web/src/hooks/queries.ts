import { useQuery } from '@tanstack/react-query';
import {
  getProduct,
  listCategories,
  listInventory,
  listProducts,
  type ProductListParams,
} from '../api/catalog.js';
import { getAnalyticsSummary } from '../api/analytics.js';
import { getCollection, listCollections, type CollectionListParams } from '../api/collections.js';
import { getHome } from '../api/content.js';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: Boolean(id),
  });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories });
}

export function useInventory(params: { page?: number; pageSize?: number; lowStockOnly?: boolean }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => listInventory(params),
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
  });
}

export function useCollections(params: CollectionListParams = {}) {
  return useQuery({
    queryKey: ['collections', params],
    queryFn: () => listCollections(params),
  });
}

export function useCollection(id: string | undefined) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => getCollection(id!),
    enabled: Boolean(id),
  });
}

export function useHomePage() {
  return useQuery({ queryKey: ['content', 'home'], queryFn: getHome });
}
