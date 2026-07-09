import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateVariantSchema, type UpdateVariantInput } from '@arts/shared';
import type { Variant } from '../../api/catalog.js';
import { useUpdateVariant } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Input,
  Select,
  Spinner,
  useToast,
} from '@arts/ui';

export function VariantEditDialog({
  productId,
  variant,
  open,
  onOpenChange,
}: {
  productId: string;
  variant: Variant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMut = useUpdateVariant(productId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVariantInput>({
    resolver: zodResolver(updateVariantSchema),
    defaultValues: { sku: '', name: '', isActive: true },
  });

  useEffect(() => {
    if (open && variant) {
      reset({
        sku: variant.sku,
        name: variant.name,
        price: variant.price ?? undefined,
        isActive: variant.isActive,
      });
    }
  }, [open, variant, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!variant) return;
    try {
      await updateMut.mutateAsync({ variantId: variant.id, body: values });
      toast.success('Variant updated.');
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to update variant.');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title="Edit variant" />
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="SKU" htmlFor="ve-sku" error={errors.sku?.message}>
            <Input id="ve-sku" {...register('sku')} />
          </Field>
          <Field label="Name" htmlFor="ve-name" error={errors.name?.message}>
            <Input id="ve-name" {...register('name')} />
          </Field>
          <Field label="Price" htmlFor="ve-price" error={errors.price?.message}>
            <Input
              id="ve-price"
              {...register('price', { setValueAs: (v) => (v ? v : undefined) })}
              placeholder="0.00"
              inputMode="decimal"
            />
          </Field>
          <Field label="Status" htmlFor="ve-active">
            <Select id="ve-active" {...register('isActive', { setValueAs: (v) => v === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? <Spinner /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
