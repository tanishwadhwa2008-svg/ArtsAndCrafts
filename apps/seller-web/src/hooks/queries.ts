import { useQuery } from '@tanstack/react-query';
import {
  getProduct,
  listCategories,
  listInventory,
  listProducts,
  type ProductListParams,
} from '../api/catalog.js';

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
