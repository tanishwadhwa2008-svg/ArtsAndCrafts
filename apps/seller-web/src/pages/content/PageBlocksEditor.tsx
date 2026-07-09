import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { SUPPORTED_BLOCK_TYPES, type ContentBlockInput } from '@arts/shared';
import type { ContentBlock } from '../../api/content.js';
import { useAddBlock, useDeleteBlock, useReorderBlocks } from '../../hooks/mutations.js';
import { ApiError } from '../../lib/api.js';
import {
  Button,
  Card,
  CardContent,
  Select,
  Spinner,
  useConfirm,
  useToast,
} from '@arts/ui';
import { BlockEditDialog } from './BlockEditDialog.js';
import { BLOCK_LABELS } from './block-meta.js';

function defaultPayload(type: string): Record<string, unknown> {
  switch (type) {
    case 'HERO':
      return { heading: 'New hero heading' };
    case 'BANNER':
      return { heading: 'New banner' };
    case 'RICH_TEXT':
      return { heading: '', body: 'Add your text here.' };
    case 'FEATURED_COLLECTIONS':
      return { collectionIds: [] };
    case 'PRODUCT_GRID':
      return { productIds: [] };
    default:
      return {};
  }
}

function blockSummary(block: ContentBlock): string {
  const p = (block.payload ?? {}) as Record<string, unknown>;
  const heading = typeof p.heading === 'string' ? p.heading.trim() : '';
  if (block.type === 'FEATURED_COLLECTIONS') {
    const n = Array.isArray(p.collectionIds) ? p.collectionIds.length : 0;
    return heading || `${n} collection${n === 1 ? '' : 's'}`;
  }
  if (block.type === 'PRODUCT_GRID') {
    const n = Array.isArray(p.productIds) ? p.productIds.length : 0;
    return heading || `${n} product${n === 1 ? '' : 's'}`;
  }
  if (block.type === 'RICH_TEXT' && !heading) {
    return typeof p.body === 'string' ? p.body.slice(0, 80) : 'Rich text';
  }
  return heading || '—';
}

/** Reusable block manager for any content page (homepage or static page). */
export function PageBlocksEditor({ pageId, blocks }: { pageId: string; blocks: ContentBlock[] }) {
  const addMut = useAddBlock(pageId);
  const deleteMut = useDeleteBlock(pageId);
  const reorderMut = useReorderBlocks(pageId);
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<ContentBlock | null>(null);

  const busy = addMut.isPending || deleteMut.isPending || reorderMut.isPending;
  const onError = (e: unknown) =>
    toast.error(e instanceof ApiError ? e.message : 'Something went wrong.');

  const addBlock = (type: string) => {
    if (!type) return;
    addMut.mutate({ type, payload: defaultPayload(type) } as unknown as ContentBlockInput, {
      onSuccess: () => toast.success('Block added.'),
      onError,
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const ids = blocks.map((b) => b.id);
    const current = ids[index];
    const swap = ids[target];
    if (current === undefined || swap === undefined) return;
    ids[index] = swap;
    ids[target] = current;
    reorderMut.mutate(ids, { onError });
  };

  const remove = async (block: ContentBlock) => {
    const ok = await confirm({
      title: 'Delete block',
      message: `Delete this ${BLOCK_LABELS[block.type] ?? block.type} block?`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(block.id, { onSuccess: () => toast.success('Block removed.'), onError });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-sm text-muted">
          {blocks.length} block{blocks.length === 1 ? '' : 's'}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {busy ? <Spinner className="text-gold-500" /> : null}
          <Select
            aria-label="Add block"
            value=""
            onChange={(e) => addBlock(e.target.value)}
            disabled={busy}
            className="max-w-[16rem]"
          >
            <option value="">Add a block…</option>
            {SUPPORTED_BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {BLOCK_LABELS[t] ?? t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="py-12 text-center text-muted">No blocks yet. Add your first block.</p>
      ) : (
        <ul className="space-y-3">
          {blocks.map((block, index) => (
            <li key={block.id}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <span className="w-6 text-center text-xs text-faint">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">
                      {BLOCK_LABELS[block.type] ?? block.type}
                    </p>
                    <p className="truncate text-xs text-muted">{blockSummary(block)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy || index === 0}
                      onClick={() => move(index, -1)}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy || index === blocks.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(block)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(block)}
                      aria-label="Delete"
                      className="text-danger/80 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <BlockEditDialog
          pageId={pageId}
          block={editing}
          open={Boolean(editing)}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}
