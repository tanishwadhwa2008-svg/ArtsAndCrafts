import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { createContentPageSchema, type CreateContentPageInput } from '@arts/shared';
import { useContentPage } from '../../hooks/queries.js';
import { useCreateContentPage, useUpdateContentPage } from '../../hooks/mutations.js';
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
import { PageBlocksEditor } from './PageBlocksEditor.js';

const TYPES = ['STORY', 'ABOUT', 'CUSTOM'] as const;
const STATUSES = ['DRAFT', 'PUBLISHED'] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function PageEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const pageQuery = useContentPage(id);
  const createMut = useCreateContentPage();
  const updateMut = useUpdateContentPage();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateContentPageInput>({
    resolver: zodResolver(createContentPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      type: 'CUSTOM',
      status: 'DRAFT',
      metaTitle: '',
      metaDescription: '',
    },
  });

  const page = pageQuery.data;
  useEffect(() => {
    if (isEdit && page) {
      reset({
        title: page.title,
        slug: page.slug,
        type: page.type as CreateContentPageInput['type'],
        status: page.status,
        metaTitle: page.metaTitle ?? '',
        metaDescription: page.metaDescription ?? '',
      });
    }
  }, [isEdit, page, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, body: values });
        toast.success('Page saved.');
      } else {
        const created = await createMut.mutateAsync(values);
        toast.success('Page created.');
        navigate(`/pages/${created.id}/edit`, { replace: true });
      }
    } catch {
      /* surfaced below */
    }
  });

  const pending = createMut.isPending || updateMut.isPending;
  const activeError = createMut.error ?? updateMut.error;
  const apiError = activeError instanceof ApiError ? activeError.message : null;

  if (isEdit && pageQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-muted">
        <Spinner className="text-gold-500" /> Loading page…
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/pages"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to pages
      </Link>

      <PageHeader eyebrow="Storefront" title={isEdit ? 'Edit page' : 'New page'} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Title" htmlFor="pg-title" error={errors.title?.message}>
              <Input
                id="pg-title"
                {...register('title')}
                onBlur={(e) => {
                  if (!isEdit && !watch('slug') && e.target.value) {
                    setValue('slug', slugify(e.target.value), { shouldValidate: true });
                  }
                }}
              />
            </Field>

            <Field label="Slug" htmlFor="pg-slug" error={errors.slug?.message}>
              <Input id="pg-slug" {...register('slug')} />
            </Field>

            <Field label="Type" htmlFor="pg-type" error={errors.type?.message}>
              <Select id="pg-type" {...register('type')} disabled={isEdit}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status" htmlFor="pg-status" error={errors.status?.message}>
              <Select id="pg-status" {...register('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Meta title (SEO)" htmlFor="pg-mt" error={errors.metaTitle?.message}>
                <Input id="pg-mt" {...register('metaTitle')} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Meta description (SEO)"
                htmlFor="pg-md"
                error={errors.metaDescription?.message}
              >
                <Textarea id="pg-md" {...register('metaDescription')} />
              </Field>
            </div>

            <div className="md:col-span-2">
              {apiError ? <p className="mb-3 text-sm text-danger">{apiError}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => navigate('/pages')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Spinner /> : null}
                  {isEdit ? 'Save changes' : 'Create page'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isEdit && page ? (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg text-gold-300">Page content</h2>
          <PageBlocksEditor pageId={page.id} blocks={page.blocks} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-faint">Save the page first to add content blocks.</p>
      )}
    </div>
  );
}
