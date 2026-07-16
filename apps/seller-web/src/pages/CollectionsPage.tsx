import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { CollectionListItem } from '../api/collections.js';
import { useAiStatus, useCollections } from '../hooks/queries.js';
import { useDeleteCollection } from '../hooks/mutations.js';
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

export function CollectionsPage() {
  const { data, isLoading, isError } = useCollections();
  const aiStatus = useAiStatus();
  const deleteMut = useDeleteCollection();
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const remove = async (collection: CollectionListItem) => {
    const ok = await confirm({
      title: 'Delete collection',
      message: `Delete collection "${collection.title}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(collection.id, {
      onSuccess: () => toast.success('Collection deleted.'),
      onError: (e) =>
        toast.error(e instanceof ApiError ? e.message : 'Failed to delete collection.'),
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Storefront"
        title="Collections"
        actions={
          <div className="flex flex-wrap gap-2">
            {aiStatus.data?.available ? (
              <Button variant="outline" onClick={() => navigate('/collections/ai-bulk')}>
                <Sparkles className="h-4 w-4" />
                AI Bulk Upload
              </Button>
            ) : null}
            <Button onClick={() => navigate('/collections/new')}>
              <Plus className="h-4 w-4" />
              New collection
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading collections…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load collections.</p>
      ) : !data || data.length === 0 ? (
        <p className="py-16 text-center text-muted">No collections yet.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Slug</TH>
              <TH>Status</TH>
              <TH>Products</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-fg">{c.title}</TD>
                <TD className="text-muted">{c.slug}</TD>
                <TD>
                  <Badge variant={c.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {c.status}
                  </Badge>
                </TD>
                <TD>{c.productCount}</TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/collections/${c.id}/edit`)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(c)}
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
