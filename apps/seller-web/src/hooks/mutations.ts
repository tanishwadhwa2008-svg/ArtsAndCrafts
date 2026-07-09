import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/catalog.js';
import * as collectionsApi from '../api/collections.js';
import * as contentApi from '../api/content.js';

/** Invalidates the queries affected by catalog/inventory mutations. */
function useInvalidators() {
  const qc = useQueryClient();
  return {
    products: () => qc.invalidateQueries({ queryKey: ['products'] }),
    product: (id: string) => qc.invalidateQueries({ queryKey: ['product', id] }),
    categories: () => qc.invalidateQueries({ queryKey: ['categories'] }),
    inventory: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
    collections: () => qc.invalidateQueries({ queryKey: ['collections'] }),
    collection: (id: string) => qc.invalidateQueries({ queryKey: ['collection', id] }),
    home: () => qc.invalidateQueries({ queryKey: ['content', 'home'] }),
    contentPages: () => qc.invalidateQueries({ queryKey: ['content', 'pages'] }),
    contentPage: (id: string) => qc.invalidateQueries({ queryKey: ['content', 'page', id] }),
  };
}

// --- Categories ---

export function useCreateCategory() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => inv.categories(),
  });
}

export function useUpdateCategory() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { id: string; body: Parameters<typeof api.updateCategory>[1] }) =>
      api.updateCategory(args.id, args.body),
    onSuccess: () => inv.categories(),
  });
}

export function useDeleteCategory() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => inv.categories(),
  });
}

// --- Products ---

export function useCreateProduct() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => inv.products(),
  });
}

export function useUpdateProduct() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { id: string; body: Parameters<typeof api.updateProduct>[1] }) =>
      api.updateProduct(args.id, args.body),
    onSuccess: (_data, args) => {
      inv.products();
      inv.product(args.id);
    },
  });
}

export function useDeleteProduct() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => inv.products(),
  });
}

// --- Variants ---

export function useAddVariant(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.addVariant>[1]) => api.addVariant(productId, body),
    onSuccess: () => {
      inv.product(productId);
      inv.inventory();
    },
  });
}

export function useUpdateVariant(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { variantId: string; body: Parameters<typeof api.updateVariant>[1] }) =>
      api.updateVariant(args.variantId, args.body),
    onSuccess: () => {
      inv.product(productId);
      inv.inventory();
    },
  });
}

export function useDeleteVariant(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.deleteVariant,
    onSuccess: () => {
      inv.product(productId);
      inv.inventory();
    },
  });
}

// --- Images ---

export function useAddImage(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (body: Parameters<typeof api.addImage>[1]) => api.addImage(productId, body),
    onSuccess: () => inv.product(productId),
  });
}

export function useSetPrimaryImage(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.setPrimaryImage,
    onSuccess: () => inv.product(productId),
  });
}

export function useUpdateImage(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { imageId: string; body: Parameters<typeof api.updateImage>[1] }) =>
      api.updateImage(args.imageId, args.body),
    onSuccess: () => inv.product(productId),
  });
}

export function useDeleteImage(productId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: api.deleteImage,
    onSuccess: () => inv.product(productId),
  });
}

// --- Inventory ---

export function useAdjustInventory() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { variantId: string; body: Parameters<typeof api.adjustInventory>[1] }) =>
      api.adjustInventory(args.variantId, args.body),
    onSuccess: () => inv.inventory(),
  });
}

// --- Collections ---

export function useCreateCollection() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: collectionsApi.createCollection,
    onSuccess: () => inv.collections(),
  });
}

export function useUpdateCollection() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { id: string; body: Parameters<typeof collectionsApi.updateCollection>[1] }) =>
      collectionsApi.updateCollection(args.id, args.body),
    onSuccess: (_data, args) => {
      inv.collections();
      inv.collection(args.id);
    },
  });
}

export function useDeleteCollection() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: collectionsApi.deleteCollection,
    onSuccess: () => inv.collections(),
  });
}

export function useSetCollectionProducts(collectionId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (productIds: string[]) =>
      collectionsApi.setCollectionProducts(collectionId, productIds),
    onSuccess: () => {
      inv.collections();
      inv.collection(collectionId);
    },
  });
}

// --- Content pages / blocks ---

export function useCreateContentPage() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: contentApi.createContentPage,
    onSuccess: () => inv.contentPages(),
  });
}

export function useUpdateContentPage() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { id: string; body: Parameters<typeof contentApi.updateContentPage>[1] }) =>
      contentApi.updateContentPage(args.id, args.body),
    onSuccess: (_data, args) => {
      inv.home();
      inv.contentPage(args.id);
      inv.contentPages();
    },
  });
}

export function useDeleteContentPage() {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: contentApi.deleteContentPage,
    onSuccess: () => inv.contentPages(),
  });
}

export function useAddBlock(pageId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (body: Parameters<typeof contentApi.addBlock>[1]) =>
      contentApi.addBlock(pageId, body),
    onSuccess: () => {
      inv.home();
      inv.contentPage(pageId);
    },
  });
}

export function useUpdateBlock(pageId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (args: { blockId: string; body: Parameters<typeof contentApi.updateBlock>[2] }) =>
      contentApi.updateBlock(pageId, args.blockId, args.body),
    onSuccess: () => {
      inv.home();
      inv.contentPage(pageId);
    },
  });
}

export function useDeleteBlock(pageId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (blockId: string) => contentApi.deleteBlock(pageId, blockId),
    onSuccess: () => {
      inv.home();
      inv.contentPage(pageId);
    },
  });
}

export function useReorderBlocks(pageId: string) {
  const inv = useInvalidators();
  return useMutation({
    mutationFn: (blockIds: string[]) => contentApi.reorderBlocks(pageId, blockIds),
    onSuccess: () => {
      inv.home();
      inv.contentPage(pageId);
    },
  });
}
