import { AlertTriangle, Boxes, FolderTree, Layers, Package, Wallet } from 'lucide-react';
import { PageHeader } from '../components/ui/page-header.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Spinner } from '../components/ui/spinner.js';
import { BarChart } from '../components/ui/bar-chart.js';
import { useAnalyticsSummary } from '../hooks/queries.js';

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

const STATUS_LABEL: Record<'ACTIVE' | 'DRAFT' | 'ARCHIVED', string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

export function DashboardPage() {
  const { data, isLoading, isError } = useAnalyticsSummary();

  const statusData = data
    ? (['ACTIVE', 'DRAFT', 'ARCHIVED'] as const).map((key) => ({
        label: STATUS_LABEL[key],
        value: data.products.byStatus[key],
      }))
    : [];

  const categoryData = (data?.productsByCategory ?? []).slice(0, 8).map((c) => ({
    label: c.name,
    value: c.productCount,
    hint: `${c.productCount} product${c.productCount === 1 ? '' : 's'}`,
  }));

  const inventoryValue = data?.inventory.valueByCurrency.length
    ? data.inventory.valueByCurrency.map((v) => `${v.currency} ${v.value}`).join(' · ')
    : '—';

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Dashboard" />

      {isError ? (
        <p className="py-16 text-center text-danger">Failed to load analytics.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Products"
              value={data?.products.total ?? 0}
              icon={Package}
              loading={isLoading}
            />
            <StatCard
              label="Categories"
              value={data?.categories.total ?? 0}
              icon={FolderTree}
              loading={isLoading}
            />
            <StatCard
              label="Tracked Variants"
              value={data?.variants.total ?? 0}
              icon={Boxes}
              loading={isLoading}
            />
            <StatCard
              label="Units On Hand"
              value={data?.inventory.totalUnits ?? 0}
              icon={Layers}
              loading={isLoading}
            />
            <StatCard
              label="Inventory Value"
              value={inventoryValue}
              icon={Wallet}
              loading={isLoading}
            />
            <StatCard
              label="Low Stock"
              value={data?.inventory.lowStockCount ?? 0}
              icon={AlertTriangle}
              loading={isLoading}
              accent
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Products by status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-6 text-muted">
                    <Spinner className="text-gold-500" /> Loading…
                  </div>
                ) : (
                  <BarChart data={statusData} emptyLabel="No products yet." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products by category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-6 text-muted">
                    <Spinner className="text-gold-500" /> Loading…
                  </div>
                ) : (
                  <BarChart data={categoryData} emptyLabel="No categorized products yet." />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
