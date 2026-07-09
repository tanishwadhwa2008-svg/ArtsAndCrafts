import { cn } from '../../lib/cn.js';

/**
 * BloomLoader — a premium, artisanal loading indicator for the storefront.
 *
 * A geometric "flower of life" whose petals draw themselves on one cycle and
 * un-draw on the next while the whole motif rotates slowly. Self-contained
 * (scoped `<style>`, no external CSS), inherits its colour from `currentColor`,
 * and collapses to a static drawn state under `prefers-reduced-motion`.
 */
export function BloomLoader({
  className,
  label = 'Loading',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex h-10 w-10 text-gold-500', className)}
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" aria-hidden>
        <style>{`
          .bloom { transform-box: fill-box; transform-origin: center; animation: bloom-rot 9s linear infinite; }
          .bloom circle {
            stroke: currentColor; stroke-width: 1.1; fill: none; stroke-linecap: round;
            stroke-dasharray: 50.27; stroke-dashoffset: 50.27;
            animation: bloom-draw 2.2s ease-in-out infinite alternate;
          }
          .bloom circle:nth-child(1){animation-delay:0s}
          .bloom circle:nth-child(2){animation-delay:.1s}
          .bloom circle:nth-child(3){animation-delay:.2s}
          .bloom circle:nth-child(4){animation-delay:.3s}
          .bloom circle:nth-child(5){animation-delay:.4s}
          .bloom circle:nth-child(6){animation-delay:.5s}
          .bloom circle:nth-child(7){animation-delay:.6s}
          @keyframes bloom-draw { to { stroke-dashoffset: 0; } }
          @keyframes bloom-rot { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) {
            .bloom, .bloom circle { animation: none; }
            .bloom circle { stroke-dashoffset: 0; }
          }
        `}</style>
        <g className="bloom">
          <circle cx="24" cy="24" r="8" />
          <circle cx="32" cy="24" r="8" />
          <circle cx="28" cy="30.93" r="8" />
          <circle cx="20" cy="30.93" r="8" />
          <circle cx="16" cy="24" r="8" />
          <circle cx="20" cy="17.07" r="8" />
          <circle cx="28" cy="17.07" r="8" />
        </g>
      </svg>
    </span>
  );
}
