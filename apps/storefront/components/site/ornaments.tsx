import type { ReactNode } from 'react';

/**
 * Decorative ornaments for the storefront's heritage chrome.
 *
 * All pieces are purely decorative (aria-hidden) inline SVG that inherit the
 * current text colour, so they can be tinted with the gold token utilities
 * (e.g. `text-gold-400`, `text-gold-500/[0.06]`).
 */

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M6 46 L6 6 L46 6" strokeWidth="1.25" />
        <path d="M6 27 C6 15.4 15.4 6 27 6" strokeWidth="1" opacity="0.85" />
        <path d="M17 36 C17 25.5 25.5 17 36 17" strokeWidth="0.9" opacity="0.55" />
      </g>
      <circle cx="36" cy="36" r="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * A gold double-border frame with filigree corners. Wrap hero / feature
 * content; pass padding via `className` on the inner content wrapper.
 */
export function OrnateFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border border-gold-600/45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[7px] border border-gold-500/25"
      />
      <CornerFlourish className="pointer-events-none absolute left-0 top-0 h-10 w-10 text-gold-400" />
      <CornerFlourish className="pointer-events-none absolute right-0 top-0 h-10 w-10 rotate-90 text-gold-400" />
      <CornerFlourish className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 rotate-180 text-gold-400" />
      <CornerFlourish className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 -rotate-90 text-gold-400" />
      <div className={`relative ${className ?? ''}`}>{children}</div>
    </div>
  );
}

/** Classic paisley (buta) motif — used as a faint watermark. */
export function Paisley({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" aria-hidden="true" className={className}>
      <path
        d="M312 44C188 44 96 148 96 272c0 92 56 160 140 188-46-32-74-82-74-142 0-98 79-177 177-177 72 0 130 58 130 130 0 52-42 94-94 94-39 0-70-31-70-70 0-28 23-51 51-51"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M300 120c-70 8-126 66-132 138"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
