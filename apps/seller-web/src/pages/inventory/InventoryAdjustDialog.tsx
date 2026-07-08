import { useEffect, useState } from 'react';
import type { InventoryItem } from '../../api/catalog.js';
import { useAdjustInventory } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../../components/ui/dialog.js';
import { Field } from '../../components/ui/form-field.js';
import { Input } from '../../components/ui/input.js';
import { Button } from '../../components/ui/button.js';
import { Spinner } from '../../components/ui/spinner.js';

export function InventoryAdjustDialog({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const adjustMut = useAdjustInventory();
  const [quantity, setQuantity] = useState(0);
  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    if (open && item) {
      setQuantity(item.quantity);
      setThreshold(item.lowStockThreshold);
      adjustMut.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await adjustMut.mutateAsync({
        variantId: item.variantId,
        body: {
          setQuantity: quantity,
          lowStockThreshold: threshold,
          expectedVersion: item.version,
        },
      });
      onOpenChange(false);
    } catch {
      /* surfaced below */
    }
  };

  const apiError = adjustMut.error instanceof ApiError ? adjustMut.error.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title="Adjust stock"
          description={
            item ? `${item.productTitle} · ${item.variantName} (${item.sku})` : undefined
          }
        />
        <form onSubmit={submit} className="space-y-4">
          <Field label="Quantity on hand" htmlFor="inv-qty">
            <Input
              id="inv-qty"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Field>
          <Field
            label="Low-stock threshold"
            htmlFor="inv-thr"
            hint="Flagged as low when quantity falls to or below this."
          >
            <Input
              id="inv-thr"
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </Field>

          {apiError ? <p className="text-sm text-danger">{apiError}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustMut.isPending}>
              {adjustMut.isPending ? <Spinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
