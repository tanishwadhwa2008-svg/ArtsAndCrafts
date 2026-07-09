import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Product } from '../api/catalog.js';
import { useProducts } from '../hooks/queries.js';
import { useDeleteProduct } from '../hooks/mutations.js';
import { ApiError } from '../lib/api.js';
import {
  Badge,
  Button,
  Input,
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

const PAGE_SIZE = 10;

function statusVariant(status: Product['status']): 'gold' | 'neutral' | 'success' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'DRAFT') return 'gold';
  return 'neutral';
}

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const deleteMut = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();

  const { data, isLoading, isError } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const remove = async (product: Product) => {
    const ok = await confirm({
      title: 'Delete product',
      message: `Delete product "${product.title}"? This also removes its variants and images.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    deleteMut.mutate(product.id, {
      onSuccess: () => toast.success('Product deleted.'),
      onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Failed to delete product.'),
    });
  };

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="h-4 w-4" />
              New product
            </Link>
          </Button>
        }
      />

      <form onSubmit={submitSearch} className="mb-4 flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="md">
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-muted">
          <Spinner className="text-gold-500" /> Loading products…
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-danger">Failed to load products.</p>
      ) : !data || data.items.length === 0 ? (
        <p className="py-16 text-center text-muted">No products found.</p>
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH>Base price</TH>
                <TH>Variants</TH>
                <TH>Updated</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {data.items.map((p) => (
                <TR key={p.id}>
                  <TD className="font-medium text-fg">
                    <Link to={`/products/${p.id}/edit`} className="hover:text-gold-300">
                      {p.title}
                    </Link>
                  </TD>
                  <TD>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TD>
                  <TD>
                    <span className="text-gold-300">
                      {p.currency} {p.basePrice}
                    </span>
                  </TD>
                  <TD>{p.variants.length}</TD>
                  <TD className="text-muted">{new Date(p.updatedAt).toLocaleDateString()}</TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link to={`/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
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

          <div className="mt-4 flex items-center justify-between text-sm text-muted">
            <span>
              {meta?.total ?? 0} product{(meta?.total ?? 0) === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
