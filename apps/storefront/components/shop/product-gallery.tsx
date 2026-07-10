'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@arts/ui';
import type { ProductImage } from '@/lib/storefront';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

/**
 * Interactive product gallery: click a thumbnail to swap the main image, and
 * click the main image to open a full-screen lightbox (object-contain, so the
 * whole, uncropped piece can be inspected) with prev/next navigation.
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const count = images.length;

  // Arrow-key navigation while the lightbox is open.
  useEffect(() => {
    if (!lightboxOpen || count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, count]);

  if (count === 0) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2" />
    );
  }

  const current = images[active] ?? images[0];
  if (!current) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2" />
    );
  }

  const go = (dir: number) => setActive((i) => (i + dir + count) % count);

  return (
    <div>
      {/* Main image — click to inspect in the lightbox. */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="View full image"
        className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
      >
        <Image
          key={current.url}
          src={current.url}
          alt={current.altText ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          priority
        />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 border border-gold-500/40 bg-bg/70 px-2.5 py-1 text-[0.7rem] uppercase tracking-[0.14em] text-gold-200 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          Zoom
        </span>
      </button>

      {/* Thumbnails — click to swap the main image. */}
      {count > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, index) => {
            const selected = index === active;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-current={selected}
                className={cn(
                  'relative aspect-square overflow-hidden border bg-surface-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50',
                  selected
                    ? 'border-gold-500 ring-1 ring-gold-500/50'
                    : 'border-line opacity-70 hover:border-gold-500/50 hover:opacity-100',
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${title} — view ${index + 1}`}
                  fill
                  sizes="12vw"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Lightbox. */}
      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            data-drawer-overlay
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm"
          />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[60] flex flex-col focus:outline-none"
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>

            <div className="flex justify-end p-4">
              <Dialog.Close
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center border border-line/60 text-muted transition-colors hover:border-gold-500/50 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16">
              {count > 1 ? (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line/60 bg-bg/60 text-muted backdrop-blur-sm transition-colors hover:border-gold-500/50 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
              ) : null}

              <div className="relative h-full w-full max-w-4xl">
                <Image
                  key={current.url}
                  src={current.url}
                  alt={current.altText ?? title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>

              {count > 1 ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-line/60 bg-bg/60 text-muted backdrop-blur-sm transition-colors hover:border-gold-500/50 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div className="pb-6 text-center font-serif text-xs uppercase tracking-[0.18em] text-muted">
                {active + 1} / {count}
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
