import { useEffect, useState } from 'react';
import { Boxes } from 'lucide-react';
import type { InventoryInfo } from '../../api/catalog.js';
import { useAdjustInventory } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Spinner,
  useToast,
} from '@arts/ui';

/** Inline stock editor shown on the product edit page (product-level inventory). */
export function StockSection({
  productId,
  inventory,
}: {
  productId: string;
  inventory: InventoryInfo | null;
}) {
  const adjustMut = useAdjustInventory();
  const toast = useToast();
  const [quantity, setQuantity] = useState(0);
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    setQuantity(inventory?.quantity ?? 0);
    setThreshold(inventory?.lowStockThreshold ?? 0);
  }, [inventory?.quantity, inventory?.lowStockThreshold]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adjustMut.mutateAsync({
        productId,
        body: {
          setQuantity: quantity,
          lowStockThreshold: threshold,
          expectedVersion: inventory?.version,
        },
      });
      toast.success('Stock updated.');
    } catch {
      /* surfaced below */
    }
  };

  const apiError = adjustMut.error instanceof ApiError ? adjustMut.error.message : null;
  const reserved = inventory?.reserved ?? 0;
  const available = Math.max(0, quantity - reserved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-gold-500" /> Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Stock on hand" htmlFor="stock-qty">
            <Input
              id="stock-qty"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Field>
          <Field
            label="Low-stock threshold"
            htmlFor="stock-thr"
            hint="Flagged as low when stock falls to or below this."
          >
            <Input
              id="stock-thr"
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </Field>

          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <p className="text-sm text-muted">
              {reserved > 0 ? `${reserved} reserved · ` : ''}
              {available} available
            </p>
            <div className="flex items-center gap-3">
              {apiError ? <p className="text-sm text-danger">{apiError}</p> : null}
              <Button type="submit" disabled={adjustMut.isPending}>
                {adjustMut.isPending ? <Spinner /> : null}
                Save stock
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
