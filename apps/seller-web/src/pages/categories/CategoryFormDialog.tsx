import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema, type CreateCategoryInput } from '@arts/shared';
import type { Category } from '../../api/catalog.js';
import { useCreateCategory, useUpdateCategory } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../../components/ui/dialog.js';
import { Field } from '../../components/ui/form-field.js';
import { Input } from '../../components/ui/input.js';
import { Textarea } from '../../components/ui/textarea.js';
import { Button } from '../../components/ui/button.js';
import { Spinner } from '../../components/ui/spinner.js';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}) {
  const isEdit = Boolean(category);
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: '', slug: '', description: '', position: 0 },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        position: category?.position ?? 0,
      });
    }
  }, [open, category, reset]);

  const nameValue = watch('name');

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && category) {
        await updateMut.mutateAsync({ id: category.id, body: values });
      } else {
        await createMut.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      /* surfaced below */
    }
  });

  const pending = createMut.isPending || updateMut.isPending;
  const apiError =
    (createMut.error ?? updateMut.error) instanceof ApiError
      ? (createMut.error ?? updateMut.error)?.message
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title={isEdit ? 'Edit category' : 'New category'} />
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Name" htmlFor="cat-name" error={errors.name?.message}>
            <Input
              id="cat-name"
              {...register('name')}
              onBlur={(e) => {
                if (!isEdit && !watch('slug') && e.target.value) {
                  setValue('slug', slugify(e.target.value), { shouldValidate: true });
                }
              }}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="cat-slug"
            error={errors.slug?.message}
            hint="Lowercase, hyphenated. Used in URLs."
          >
            <Input id="cat-slug" {...register('slug')} placeholder={slugify(nameValue || '')} />
          </Field>

          <Field label="Description" htmlFor="cat-desc" error={errors.description?.message}>
            <Textarea id="cat-desc" {...register('description')} />
          </Field>

          <Field label="Position" htmlFor="cat-pos" error={errors.position?.message}>
            <Input id="cat-pos" type="number" {...register('position', { valueAsNumber: true })} />
          </Field>

          {apiError ? <p className="text-sm text-danger">{apiError}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : null}
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
