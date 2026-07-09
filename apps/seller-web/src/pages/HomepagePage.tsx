import { Eye, EyeOff } from 'lucide-react';
import { useHomePage } from '../hooks/queries.js';
import { useUpdateContentPage } from '../hooks/mutations.js';
import { ApiError } from '../lib/api.js';
import { Badge, Button, PageHeader, Spinner, useToast } from '@arts/ui';
import { PageBlocksEditor } from './content/PageBlocksEditor.js';

export function HomepagePage() {
  const { data: page, isLoading, isError } = useHomePage();
  const publishMut = useUpdateContentPage();
  const toast = useToast();

  const togglePublish = () => {
    if (!page) return;
    const next = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    publishMut.mutate(
      { id: page.id, body: { status: next } },
      {
        onSuccess: () =>
          toast.success(next === 'PUBLISHED' ? 'Homepage published.' : 'Homepage unpublished.'),
        onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Something went wrong.'),
      },
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Homepage"
        actions={
          page ? (
            <Button
              variant={page.status === 'PUBLISHED' ? 'outline' : 'primary'}
              onClick={togglePublish}
              disabled={publishMut.isPending}
            >
              {page.status === 'PUBLISHED' ? (
                <>
                  <EyeOff className="h-4 w-4" /> Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Publish
                </>
              )}
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading homepage…
        </div>
      ) : isError || !page ? (
        <p className="py-16 text-center text-danger">Failed to load the homepage.</p>
      ) : (
        <>
          <div className="mb-6">
            <Badge variant={page.status === 'PUBLISHED' ? 'success' : 'neutral'}>
              {page.status}
            </Badge>
          </div>
          <PageBlocksEditor pageId={page.id} blocks={page.blocks} />
        </>
      )}
    </div>
  );
}
