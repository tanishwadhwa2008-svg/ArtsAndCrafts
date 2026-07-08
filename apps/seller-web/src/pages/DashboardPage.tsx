import { AlertTriangle, Boxes, FolderTree, Package } from 'lucide-react';
import { PageHeader } from '../components/ui/page-header.js';
import { Card, CardContent } from '../components/ui/card.js';
import { Spinner } from '../components/ui/spinner.js';
import { useCategories, useInventory, useProducts } from '../hooks/queries.js';

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-faint">{label}</p>
          <p className="mt-2 font-display text-3xl text-gold-400">
            {loading ? <Spinner className="text-gold-500" /> : value}
          </p>
        </div>
        <span
          className={
            accent
              ? 'flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger'
              : 'flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500'
          }
        >
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const products = useProducts({ page: 1, pageSize: 1 });
  const categories = useCategories();
  const inventory = useInventory({ page: 1, pageSize: 1 });
  const lowStock = useInventory({ page: 1, pageSize: 1, lowStockOnly: true });

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={products.data?.meta.total ?? 0}
          icon={Package}
          loading={products.isLoading}
        />
        <StatCard
          label="Categories"
          value={categories.data?.length ?? 0}
          icon={FolderTree}
          loading={categories.isLoading}
        />
        <StatCard
          label="Tracked Variants"
          value={inventory.data?.meta.total ?? 0}
          icon={Boxes}
          loading={inventory.isLoading}
        />
        <StatCard
          label="Low Stock"
          value={lowStock.data?.meta.total ?? 0}
          icon={AlertTriangle}
          loading={lowStock.isLoading}
          accent
        />
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <p className="eyebrow mb-2">Our Legacy</p>
          <h2 className="text-xl text-gold-300">Preserving ancient craftsmanship</h2>
          <p className="mt-3 max-w-2xl font-serif text-[15px] leading-relaxed text-muted">
            Manage your catalog, variants, imagery and stock from a single, refined workspace. Every
            product you curate carries the story of a master artisan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
