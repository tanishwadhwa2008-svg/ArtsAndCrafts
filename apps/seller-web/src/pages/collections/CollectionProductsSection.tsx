import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { CollectionProduct } from '../../api/collections.js';
import { useProducts } from '../../hooks/queries.js';
import { useSetCollectionProducts } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Spinner,
  useToast,
} from '@arts/ui';

/**
 * Manages the ordered product membership of a collection. Every add / remove /
 * reorder sends the full ordered id list to the API (which derives positions),
 * so the section stays a thin, controlled view over the collection detail.
 */
export function CollectionProductsSection({
  collectionId,
  products,
}: {
  collectionId: string;
  products: CollectionProduct[];
}) {
  const setMut = useSetCollectionProducts(collectionId);
  const toast = useToast();
  const productsQuery = useProducts({ pageSize: 100 });

  const ids = products.map((p) => p.productId);
  const available = (productsQuery.data?.items ?? []).filter((p) => !ids.includes(p.id));
  const pending = setMut.isPending;

  const save = (nextIds: string[], successMessage: string) => {
    setMut.mutate(nextIds, {
      onSuccess: () => toast.success(successMessage),
      onError: (e) =>
        toast.error(e instanceof ApiError ? e.message : 'Failed to update products.'),
    });
  };

  const add = (productId: string) => {
    if (productId) save([...ids, productId], 'Product added.');
  };

  const removeAt = (index: number) => {
    save(
      ids.filter((_, i) => i !== index),
      'Product removed.',
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    const current = next[index];
    const swap = next[target];
    if (current === undefined || swap === undefined) return;
    next[index] = swap;
    next[target] = current;
    save(next, 'Order updated.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products in this collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Select
            aria-label="Add product"
            disabled={pending || available.length === 0}
            value=""
            onChange={(e) => add(e.target.value)}
            className="max-w-sm"
          >
            <option value="">{available.length ? 'Add a product…' : 'All products added'}</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
          {pending ? <Spinner className="text-gold-500" /> : null}
        </div>

        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            No products in this collection yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {products.map((p, index) => (
              <li key={p.productId} className="flex items-center gap-3 py-3">
                <span className="w-6 text-center text-xs text-faint">{index + 1}</span>
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded border border-line object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded border border-line bg-surface-2" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{p.title}</p>
                  <p className="truncate text-xs text-muted">{p.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending || index === products.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() => removeAt(index)}
                    aria-label="Remove"
                    className="text-danger/80 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
