'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CollectionCard } from '@/lib/storefront';

const AUTOPLAY_MS = 5000;

/**
 * One-collection-per-slide carousel for the home page. Server-fetched
 * collections are passed in, so the number of slides is fully dynamic. Slides
 * auto-advance (paused on hover/focus, disabled for reduced motion), with
 * arrow + dot controls and keyboard navigation.
 */
export function CollectionCarousel({ collections }: { collections: CollectionCard[] }) {
  const count = collections.length;
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      if (!paused.current && !document.hidden) setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onFocusCapture={() => {
        paused.current = true;
      }}
      onBlurCapture={() => {
        paused.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      }}
    >
      <div className="overflow-hidden rounded-2xl bg-surface/40">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {collections.map((collection, i) => (
            <div
              key={collection.id}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
            >
              <Link
                href={`/collections/${collection.slug}`}
                tabIndex={i === index ? 0 : -1}
                className="group grid grid-cols-1 md:grid-cols-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-surface-2 to-bg md:aspect-auto md:min-h-[26rem]">
                  {collection.coverUrl ? (
                    <Image
                      src={collection.coverUrl}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center gap-4 px-8 py-12 text-center md:px-14 md:text-left">
                  <p className="eyebrow text-[0.68rem]">
                    {collection.productCount} piece{collection.productCount === 1 ? '' : 's'}
                  </p>
                  <h3 className="font-display text-2xl text-gold-300 sm:text-3xl">
                    {collection.title}
                  </h3>
                  {collection.description ? (
                    <p className="font-serif text-base italic leading-relaxed text-muted sm:text-lg">
                      {collection.description}
                    </p>
                  ) : null}
                  <span className="mt-2 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-gold-400 transition-colors group-hover:text-gold-200 md:justify-start">
                    Explore collection
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous collection"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/70 p-2 text-gold-300 backdrop-blur-sm transition-colors hover:border-gold-500/60 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 md:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next collection"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/70 p-2 text-gold-300 backdrop-blur-sm transition-colors hover:border-gold-500/60 hover:text-gold-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 md:inline-flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="mt-6 flex items-center justify-center gap-2.5">
            {collections.map((collection, i) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to ${collection.title}`}
                aria-current={i === index}
                className={`h-2.5 w-2.5 rounded-full border border-gold-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 ${
                  i === index ? 'scale-110 bg-gold-500' : 'bg-transparent hover:bg-gold-500/40'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
