import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { createCollectionSchema, type CreateCollectionInput } from '@arts/shared';
import { useCollection } from '../../hooks/queries.js';
import { useCreateCollection, useUpdateCollection } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  useToast,
} from '@arts/ui';
import { CollectionProductsSection } from './CollectionProductsSection.js';

const STATUSES = ['DRAFT', 'PUBLISHED'] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CollectionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const collectionQuery = useCollection(id);
  const createMut = useCreateCollection();
  const updateMut = useUpdateCollection();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: { title: '', slug: '', description: '', status: 'DRAFT', position: 0 },
  });

  const collection = collectionQuery.data;
  useEffect(() => {
    if (isEdit && collection) {
      reset({
        title: collection.title,
        slug: collection.slug,
        description: collection.description ?? '',
        status: collection.status,
        position: collection.position,
      });
    }
  }, [isEdit, collection, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, body: values });
        toast.success('Collection saved.');
      } else {
        const created = await createMut.mutateAsync(values);
        toast.success('Collection created.');
        navigate(`/collections/${created.id}/edit`, { replace: true });
      }
    } catch {
      /* surfaced below */
    }
  });

  const pending = createMut.isPending || updateMut.isPending;
  const activeError = createMut.error ?? updateMut.error;
  const apiError = activeError instanceof ApiError ? activeError.message : null;

  if (isEdit && collectionQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted">
        <Spinner className="text-gold-500" /> Loading collection…
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/collections"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to collections
      </Link>

      <PageHeader eyebrow="Storefront" title={isEdit ? 'Edit collection' : 'New collection'} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Title" htmlFor="c-title" error={errors.title?.message}>
              <Input
                id="c-title"
                {...register('title')}
                onBlur={(e) => {
                  if (!isEdit && !watch('slug') && e.target.value) {
                    setValue('slug', slugify(e.target.value), { shouldValidate: true });
                  }
                }}
              />
            </Field>

            <Field label="Slug" htmlFor="c-slug" error={errors.slug?.message}>
              <Input id="c-slug" {...register('slug')} />
            </Field>

            <Field label="Status" htmlFor="c-status" error={errors.status?.message}>
              <Select id="c-status" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Position" htmlFor="c-pos" error={errors.position?.message}>
              <Input id="c-pos" type="number" min={0} {...register('position', { valueAsNumber: true })} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description" htmlFor="c-desc" error={errors.description?.message}>
                <Textarea id="c-desc" {...register('description')} />
              </Field>
            </div>

            <div className="md:col-span-2">
              {apiError ? <p className="mb-3 text-sm text-danger">{apiError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/collections')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner /> : null}
                  {isEdit ? 'Save changes' : 'Create collection'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEdit && collection ? (
        <div className="mt-8">
          <CollectionProductsSection collectionId={collection.id} products={collection.products} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-faint">Save the collection first to add products.</p>
      )}
    </div>
  );
}
