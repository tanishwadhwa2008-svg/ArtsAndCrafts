import { cn } from '../../lib/cn.js';

export interface BarDatum {
  label: string;
  value: number;
  /** Optional display text for the value (defaults to the number). */
  hint?: string;
}

/**
 * Minimal horizontal bar chart. Bars are sized relative to the largest value,
 * so it degrades gracefully with any range of data. No external dependency —
 * keeps the bundle lean and the styling fully on-theme.
 */
export function BarChart({
  data,
  emptyLabel = 'No data yet.',
  className,
}: {
  data: BarDatum[];
  emptyLabel?: string;
  className?: string;
}) {
  if (data.length === 0) {
    return <p className="py-6 text-sm text-muted">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-fg">{d.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{d.hint ?? d.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-[width] duration-500"
              style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
