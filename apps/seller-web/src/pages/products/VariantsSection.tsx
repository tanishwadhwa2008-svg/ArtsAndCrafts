import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { createVariantSchema, type CreateVariantInput } from '@arts/shared';
import type { Variant } from '../../api/catalog.js';
import { useAddVariant, useDeleteVariant } from '../../hooks/mutations.js';
import { useToast } from '../../components/ui/toast.js';
import { useConfirm } from '../../components/ui/confirm.js';
import { ApiError } from '../../lib/api.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.js';
import { Field } from '../../components/ui/form-field.js';
import { Input } from '../../components/ui/input.js';
import { Button } from '../../components/ui/button.js';
import { Badge } from '../../components/ui/badge.js';
import { Spinner } from '../../components/ui/spinner.js';
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/table.js';
import { VariantEditDialog } from './VariantEditDialog.js';

export function VariantsSection({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const addMut = useAddVariant(productId);
  const deleteMut = useDeleteVariant(productId);
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Variant | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVariantInput>({
    resolver: zodResolver(createVariantSchema),
    defaultValues: { sku: '', name: '', isActive: true },
  });

  const onAdd = handleSubmit(async (values) => {
    try {
      await addMut.mutateAsync(values);
      reset({ sku: '', name: '', isActive: true });
      toast.success('Variant added.');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to add variant.');
    }
  });

  const removeVariant = async (v: Variant) => {
    const ok = await confirm({
      title: 'Delete variant',
      message: `Delete variant "${v.name}"? This also removes its inventory record.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(v.id);
      toast.success('Variant deleted.');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to delete variant.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variants &amp; stock</CardTitle>
      </CardHeader>
      <CardContent>
        {variants.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>SKU</TH>
                <TH>Name</TH>
                <TH>Price</TH>
                <TH>On hand</TH>
                <TH>Active</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {variants.map((v) => (
                <TR key={v.id}>
                  <TD className="text-muted">{v.sku}</TD>
                  <TD className="font-medium text-fg">{v.name}</TD>
                  <TD>{v.price ? <span className="text-gold-300">{v.price}</span> : '—'}</TD>
                  <TD>{v.inventory?.quantity ?? 0}</TD>
                  <TD>
                    {v.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit variant"
                        onClick={() => setEditing(v)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete variant"
                        className="text-danger/80 hover:text-danger"
                        onClick={() => void removeVariant(v)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <p className="mb-4 text-sm text-muted">No variants yet. Add one below.</p>
        )}

        <form onSubmit={onAdd} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Field label="SKU" htmlFor="v-sku" error={errors.sku?.message}>
            <Input id="v-sku" {...register('sku')} placeholder="SKU-001" />
          </Field>
          <Field label="Name" htmlFor="v-name" error={errors.name?.message}>
            <Input id="v-name" {...register('name')} placeholder="Default" />
          </Field>
          <Field label="Price" htmlFor="v-price" error={errors.price?.message}>
            <Input
              id="v-price"
              {...register('price', { setValueAs: (v) => (v ? v : undefined) })}
              placeholder="0.00"
              inputMode="decimal"
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={addMut.isPending}>
              {addMut.isPending ? <Spinner /> : <Plus className="h-4 w-4" />}
              Add variant
            </Button>
          </div>
        </form>
      </CardContent>

      <VariantEditDialog
        productId={productId}
        variant={editing}
        open={editing !== null}
        onOpenChange={(open) => (open ? undefined : setEditing(null))}
      />
    </Card>
  );
}
