import { useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { InventoryItem } from '../api/catalog.js';
import { useInventory } from '../hooks/queries.js';
import { Badge, Button, PageHeader, Spinner, Table, TBody, TD, TH, THead, TR } from '@arts/ui';
import { InventoryAdjustDialog } from './inventory/InventoryAdjustDialog.js';

const PAGE_SIZE = 10;

export function InventoryPage() {
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const { data, isLoading, isError } = useInventory({ page, pageSize: PAGE_SIZE, lowStockOnly });

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        actions={
          <Button
            variant={lowStockOnly ? 'primary' : 'outline'}
            size="md"
            onClick={() => {
              setPage(1);
              setLowStockOnly((v) => !v);
            }}
          >
            {lowStockOnly ? 'Showing low stock' : 'Low stock only'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading inventory…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load inventory.</p>
      ) : !data || data.items.length === 0 ? (
        <p className="py-16 text-center text-muted">No inventory records.</p>
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH>SKU</TH>
                <TH>On hand</TH>
                <TH>Available</TH>
                <TH>Threshold</TH>
                <TH>Status</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {data.items.map((i) => (
                <TR key={i.variantId}>
                  <TD className="font-medium text-fg">
                    {i.productTitle}
                    <span className="ml-1 text-faint">· {i.variantName}</span>
                  </TD>
                  <TD className="text-muted">{i.sku}</TD>
                  <TD>{i.quantity}</TD>
                  <TD>{i.available}</TD>
                  <TD className="text-muted">{i.lowStockThreshold}</TD>
                  <TD>
                    {i.isLowStock ? (
                      <Badge variant="danger">Low</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </TD>
                  <TD>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdjusting(i)}
                        aria-label="Adjust stock"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Adjust
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <InventoryAdjustDialog
        item={adjusting}
        open={adjusting !== null}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
      />
    </div>
  );
}
