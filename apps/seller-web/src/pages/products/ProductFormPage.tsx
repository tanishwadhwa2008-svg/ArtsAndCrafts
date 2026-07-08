import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { SUPPORTED_CURRENCIES, createProductSchema, type CreateProductInput } from '@arts/shared';
import { useCategories, useProduct } from '../../hooks/queries.js';
import { useCreateProduct, useUpdateProduct } from '../../hooks/mutations.js';
import { useToast } from '../../components/ui/toast.js';
import { ApiError } from '../../lib/api.js';
import { PageHeader } from '../../components/ui/page-header.js';
import { Card, CardContent } from '../../components/ui/card.js';
import { Field } from '../../components/ui/form-field.js';
import { Input } from '../../components/ui/input.js';
import { Textarea } from '../../components/ui/textarea.js';
import { Select } from '../../components/ui/select.js';
import { Button } from '../../components/ui/button.js';
import { Spinner } from '../../components/ui/spinner.js';
import { VariantsSection } from './VariantsSection.js';
import { ImagesSection } from './ImagesSection.js';

const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const productQuery = useProduct(id);
  const categories = useCategories();
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      status: 'DRAFT',
      basePrice: '',
      currency: 'USD',
      metaTitle: '',
      metaDescription: '',
    },
  });

  const product = productQuery.data;
  useEffect(() => {
    if (isEdit && product) {
      reset({
        title: product.title,
        slug: product.slug,
        description: product.description ?? '',
        status: product.status,
        basePrice: product.basePrice,
        currency: product.currency as CreateProductInput['currency'],
        categoryId: product.categoryId ?? undefined,
        metaTitle: product.metaTitle ?? '',
        metaDescription: product.metaDescription ?? '',
      });
    }
  }, [isEdit, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, body: values });
        toast.success('Product saved.');
      } else {
        const created = await createMut.mutateAsync(values);
        toast.success('Product created.');
        navigate(`/products/${created.id}/edit`, { replace: true });
      }
    } catch {
      /* surfaced below */
    }
  });

  const pending = createMut.isPending || updateMut.isPending;
  const activeError = createMut.error ?? updateMut.error;
  const apiError = activeError instanceof ApiError ? activeError.message : null;

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted">
        <Spinner className="text-gold-500" /> Loading product…
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <PageHeader eyebrow="Catalog" title={isEdit ? 'Edit product' : 'New product'} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Title" htmlFor="p-title" error={errors.title?.message}>
              <Input
                id="p-title"
                {...register('title')}
                onBlur={(e) => {
                  if (!isEdit && !watch('slug') && e.target.value) {
                    setValue('slug', slugify(e.target.value), { shouldValidate: true });
                  }
                }}
              />
            </Field>

            <Field label="Slug" htmlFor="p-slug" error={errors.slug?.message}>
              <Input id="p-slug" {...register('slug')} />
            </Field>

            <Field label="Base price" htmlFor="p-price" error={errors.basePrice?.message}>
              <Input
                id="p-price"
                {...register('basePrice')}
                placeholder="0.00"
                inputMode="decimal"
              />
            </Field>

            <Field label="Currency" htmlFor="p-currency" error={errors.currency?.message}>
              <Select id="p-currency" {...register('currency')}>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status" htmlFor="p-status" error={errors.status?.message}>
              <Select id="p-status" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category" htmlFor="p-cat" error={errors.categoryId?.message}>
              <Select
                id="p-cat"
                {...register('categoryId', { setValueAs: (v) => (v ? v : undefined) })}
              >
                <option value="">— None —</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description" htmlFor="p-desc" error={errors.description?.message}>
                <Textarea id="p-desc" {...register('description')} />
              </Field>
            </div>

            <Field label="Meta title (SEO)" htmlFor="p-mt" error={errors.metaTitle?.message}>
              <Input id="p-mt" {...register('metaTitle')} />
            </Field>

            <Field
              label="Meta description (SEO)"
              htmlFor="p-md"
              error={errors.metaDescription?.message}
            >
              <Input id="p-md" {...register('metaDescription')} />
            </Field>

            <div className="md:col-span-2">
              {apiError ? <p className="mb-3 text-sm text-danger">{apiError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/products')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner /> : null}
                  {isEdit ? 'Save changes' : 'Create product'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEdit && product ? (
        <div className="mt-8 space-y-8">
          <VariantsSection productId={product.id} variants={product.variants} />
          <ImagesSection productId={product.id} images={product.images} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-faint">
          Save the product first to add variants, stock and images.
        </p>
      )}
    </div>
  );
}
