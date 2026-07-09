import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ContentPageListItem } from '../api/content.js';
import { useContentPages } from '../hooks/queries.js';
import { useDeleteContentPage } from '../hooks/mutations.js';
import { ApiError } from '../lib/api.js';
import {
  Badge,
  Button,
  PageHeader,
  Spinner,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  useConfirm,
  useToast,
} from '@arts/ui';

const TYPE_LABELS: Record<string, string> = {
  STORY: 'Story',
  ABOUT: 'About',
  CUSTOM: 'Custom',
};

export function PagesPage() {
  const { data, isLoading, isError } = useContentPages();
  const deleteMut = useDeleteContentPage();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  // The homepage has its own dedicated editor; exclude it from this list.
  const pages = (data ?? []).filter((p) => p.type !== 'HOME');

  const remove = async (page: ContentPageListItem) => {
    const ok = await confirm({
      title: 'Delete page',
      message: `Delete page "${page.title}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(page.id, {
      onSuccess: () => toast.success('Page deleted.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed to delete page.'),
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Pages"
        actions={
          <Button onClick={() => navigate('/pages/new')}>
            <Plus className="h-4 w-4" />
            New page
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading pages…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load pages.</p>
      ) : pages.length === 0 ? (
        <p className="py-16 text-center text-muted">No pages yet.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Slug</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH>Blocks</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {pages.map((p) => (
              <TR key={p.id}>
                <TD className="font-medium text-fg">{p.title}</TD>
                <TD className="text-muted">/{p.slug}</TD>
                <TD>{TYPE_LABELS[p.type] ?? p.type}</TD>
                <TD>
                  <Badge variant={p.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {p.status}
                  </Badge>
                </TD>
                <TD>{p.blockCount}</TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/pages/${p.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(p)}
                      aria-label="Delete"
                      className="text-danger/80 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
