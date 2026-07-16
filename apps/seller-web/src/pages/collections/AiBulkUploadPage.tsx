import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { ArrowLeft, ImagePlus, LayoutDashboard, Sparkles, Trash2 } from 'lucide-react';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  SUPPORTED_CURRENCIES,
  slugify,
  type AiCommitInput,
  type UploadUrlInput,
} from '@arts/shared';
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
import { requestUploadUrl, uploadToStorage } from '../../api/catalog.js';
import { useAiStatus, useCategories } from '../../hooks/queries.js';
import { useAiCommit, useAiDraft } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';

type Stage = 'select' | 'review';

interface SelectItem {
  id: string;
  file: File;
  previewUrl: string;
  price: string;
}

interface ReviewProduct {
  title: string;
  slug: string;
  description: string;
  basePrice: string;
  categoryName: string;
  altText: string;
  metaTitle: string;
  metaDescription: string;
  storageKey: string;
  url: string;
  previewUrl: string;
}

interface ReviewForm {
  collection: { title: string; slug: string; description: string };
  currency: string;
  products: ReviewProduct[];
}

const MONEY_RE = /^\d{1,10}(\.\d{1,2})?$/;
const DEFAULT_CURRENCY = 'INR';

export function AiBulkUploadPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const statusQuery = useAiStatus();
  const categoriesQuery = useCategories();
  const draftMut = useAiDraft();
  const commitMut = useAiCommit();

  const maxImages = statusQuery.data?.maxImages ?? 12;
  const categoryNames = categoriesQuery.data?.map((c) => c.name) ?? [];

  const [stage, setStage] = useState<Stage>('select');
  const [items, setItems] = useState<SelectItem[]>([]);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewForm>({
    defaultValues: {
      collection: { title: '', slug: '', description: '' },
      currency: DEFAULT_CURRENCY,
      products: [],
    },
  });
  const products = useFieldArray({ control, name: 'products' });

  const pricesValid =
    items.length > 0 &&
    items.length <= maxImages &&
    items.every((i) => MONEY_RE.test(i.price.trim()));

  const addFiles = (fileList: FileList) => {
    setError(null);
    const incoming = Array.from(fileList);
    const valid = incoming.filter(
      (f) =>
        ALLOWED_IMAGE_TYPES.includes(f.type as (typeof ALLOWED_IMAGE_TYPES)[number]) &&
        f.size <= MAX_UPLOAD_BYTES,
    );
    const next = valid.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      price: '',
    }));
    setItems((prev) => [...prev, ...next].slice(0, maxImages));
    if (valid.length < incoming.length) {
      setError('Some files were skipped (unsupported type, or larger than 5 MB).');
    }
  };

  const updatePrice = (id: string, price: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, price } : i)));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const handleAnalyze = async () => {
    setError(null);
    setBusy('Uploading images…');
    try {
      const uploaded: { storageKey: string; url: string; price: string; previewUrl: string }[] = [];
      for (const item of items) {
        const target = await requestUploadUrl({
          fileName: item.file.name,
          contentType: item.file.type as UploadUrlInput['contentType'],
          size: item.file.size,
        });
        await uploadToStorage(target.uploadUrl, item.file);
        uploaded.push({
          storageKey: target.storageKey,
          url: target.publicUrl,
          price: item.price.trim(),
          previewUrl: item.previewUrl,
        });
      }

      setBusy('Analysing with AI…');
      const draft = await draftMut.mutateAsync({
        images: uploaded.map((u) => ({ storageKey: u.storageKey, url: u.url })),
      });

      reset({
        collection: {
          title: draft.collection.title,
          slug: draft.collection.slug,
          description: draft.collection.description,
        },
        currency,
        products: draft.products.map((p) => {
          const source = uploaded[p.imageIndex];
          return {
            title: p.title,
            slug: p.slug,
            description: p.description,
            basePrice: source?.price ?? '',
            categoryName: p.categoryName ?? '',
            altText: p.altText,
            metaTitle: p.metaTitle ?? '',
            metaDescription: p.metaDescription ?? '',
            storageKey: p.storageKey,
            url: p.url,
            previewUrl: source?.previewUrl ?? p.url,
          };
        }),
      });
      setStage('review');
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Something went wrong during upload or analysis.',
      );
    } finally {
      setBusy(null);
    }
  };

  const commit = async (values: ReviewForm, status: 'DRAFT' | 'PUBLISHED') => {
    const payload: AiCommitInput = {
      collection: {
        title: values.collection.title,
        slug: values.collection.slug,
        description: values.collection.description || undefined,
        status,
        position: 0,
      },
      currency: values.currency as AiCommitInput['currency'],
      products: values.products.map((p) => ({
        title: p.title,
        slug: p.slug,
        description: p.description || undefined,
        basePrice: p.basePrice,
        categoryName: p.categoryName.trim() || undefined,
        altText: p.altText || undefined,
        metaTitle: p.metaTitle || undefined,
        metaDescription: p.metaDescription || undefined,
        storageKey: p.storageKey,
        url: p.url,
      })),
    };
    try {
      const created = await commitMut.mutateAsync(payload);
      toast.success(status === 'PUBLISHED' ? 'Collection published.' : 'Draft saved.');
      navigate(`/collections/${created.id}/edit`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to save the collection.');
    }
  };

  const submitAs = (status: 'DRAFT' | 'PUBLISHED') =>
    handleSubmit((values) => commit(values, status))();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <LayoutDashboard className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/collections">
            <ArrowLeft className="h-4 w-4" /> Back to collections
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="Storefront"
        title="AI Bulk Upload"
        actions={
          stage === 'review' ? (
            <Button variant="ghost" onClick={() => setStage('select')} disabled={commitMut.isPending}>
              Back to images
            </Button>
          ) : undefined
        }
      />

      {stage === 'select' ? (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-5 max-w-2xl text-sm text-muted">
              Select one primary image per product and enter its price. After upload, the AI drafts
              the collection and each product&rsquo;s details for you to review. You can add more
              images to each product afterwards.
            </p>

            <div className="mb-5 flex flex-wrap items-end gap-4">
              <div className="w-40">
                <Field label="Currency" htmlFor="ai-currency">
                  <Select
                    id="ai-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <span className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface-2/60 px-4 text-sm text-fg transition-colors hover:border-gold-500/60">
                  <ImagePlus className="h-4 w-4" /> Add images
                </span>
              </label>
              <span className="text-xs text-faint">
                {items.length}/{maxImages} images · JPEG, PNG, WebP or GIF · max 5 MB
              </span>
            </div>

            {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

            {items.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                  <div key={item.id} className="overflow-hidden rounded-lg border border-line bg-surface-2">
                    <div className="relative aspect-[4/5]">
                      <img
                        src={item.previewUrl}
                        alt={`Selected ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => removeItem(item.id)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-fg transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <Field label={`Price (${currency})`} htmlFor={`price-${item.id}`}>
                        <Input
                          id={`price-${item.id}`}
                          inputMode="decimal"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, e.target.value)}
                          aria-invalid={item.price.trim() !== '' && !MONEY_RE.test(item.price.trim())}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-line py-12 text-center text-sm text-muted">
                No images selected yet.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              {busy ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Spinner className="text-gold-500" /> {busy}
                </span>
              ) : null}
              <Button onClick={() => void handleAnalyze()} disabled={!pricesValid || Boolean(busy)}>
                <Sparkles className="h-4 w-4" />
                Analyse {items.length > 0 ? `${items.length} ` : ''}
                {items.length === 1 ? 'image' : 'images'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          <Card>
            <CardContent className="pt-6">
              <p className="eyebrow text-xs">Collection</p>
              <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Title" htmlFor="c-title" error={errors.collection?.title?.message}>
                  <Input
                    id="c-title"
                    {...register('collection.title', { required: 'Required' })}
                    onBlur={(e) => {
                      if (!watch('collection.slug') && e.target.value) {
                        setValue('collection.slug', slugify(e.target.value), { shouldValidate: true });
                      }
                    }}
                  />
                </Field>
                <Field label="Slug" htmlFor="c-slug" error={errors.collection?.slug?.message}>
                  <Input id="c-slug" {...register('collection.slug', { required: 'Required' })} />
                </Field>
                <Field label="Currency" htmlFor="c-currency">
                  <Select id="c-currency" {...register('currency')}>
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description" htmlFor="c-desc">
                    <Textarea id="c-desc" {...register('collection.description')} />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mb-3 mt-8 text-sm text-muted">
            {products.fields.length} {products.fields.length === 1 ? 'product' : 'products'} drafted.
            Edit anything the AI got wrong, then save as a draft or publish the collection live.
          </p>

          <div className="space-y-4">
            {products.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-[9rem_1fr]">
                  <img
                    src={watch(`products.${index}.previewUrl`)}
                    alt={`Product ${index + 1}`}
                    className="aspect-[4/5] w-36 rounded-lg border border-line object-cover"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Title"
                      htmlFor={`p-title-${index}`}
                      error={errors.products?.[index]?.title?.message}
                    >
                      <Input
                        id={`p-title-${index}`}
                        {...register(`products.${index}.title`, { required: 'Required' })}
                      />
                    </Field>
                    <Field
                      label={`Price (${watch('currency')})`}
                      htmlFor={`p-price-${index}`}
                      error={errors.products?.[index]?.basePrice?.message}
                    >
                      <Input
                        id={`p-price-${index}`}
                        inputMode="decimal"
                        {...register(`products.${index}.basePrice`, {
                          required: 'Required',
                          pattern: { value: MONEY_RE, message: 'Enter a valid amount' },
                        })}
                      />
                    </Field>
                    <Field label="Slug" htmlFor={`p-slug-${index}`}>
                      <Input id={`p-slug-${index}`} {...register(`products.${index}.slug`, { required: true })} />
                    </Field>
                    <Field label="Category" htmlFor={`p-cat-${index}`}>
                      <Input
                        id={`p-cat-${index}`}
                        list="ai-category-options"
                        placeholder="e.g. Brassware"
                        {...register(`products.${index}.categoryName`)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Description" htmlFor={`p-desc-${index}`}>
                        <Textarea id={`p-desc-${index}`} {...register(`products.${index}.description`)} />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Alt text" htmlFor={`p-alt-${index}`}>
                        <Input id={`p-alt-${index}`} {...register(`products.${index}.altText`)} />
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <datalist id="ai-category-options">
            {categoryNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setStage('select')} disabled={commitMut.isPending}>
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => submitAs('DRAFT')}
              disabled={commitMut.isPending}
            >
              Save as draft
            </Button>
            <Button type="button" onClick={() => submitAs('PUBLISHED')} disabled={commitMut.isPending}>
              {commitMut.isPending ? <Spinner /> : null}
              Publish collection
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
