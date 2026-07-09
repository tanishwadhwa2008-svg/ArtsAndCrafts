import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Category } from '../api/catalog.js';
import { useCategories } from '../hooks/queries.js';
import { useDeleteCategory } from '../hooks/mutations.js';
import { ApiError } from '../lib/api.js';
import {
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
import { CategoryFormDialog } from './categories/CategoryFormDialog.js';

export function CategoriesPage() {
  const { data, isLoading, isError } = useCategories();
  const deleteMut = useDeleteCategory();
  const toast = useToast();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setDialogOpen(true);
  };
  const remove = async (category: Category) => {
    const ok = await confirm({
      title: 'Delete category',
      message: `Delete category "${category.name}"?`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(category.id, {
      onSuccess: () => toast.success('Category deleted.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed to delete category.'),
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading categories…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load categories.</p>
      ) : !data || data.length === 0 ? (
        <p className="py-16 text-center text-muted">No categories yet.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>Position</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-fg">{c.name}</TD>
                <TD className="text-muted">{c.slug}</TD>
                <TD>{c.position}</TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(c)}
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

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />
    </div>
  );
}
