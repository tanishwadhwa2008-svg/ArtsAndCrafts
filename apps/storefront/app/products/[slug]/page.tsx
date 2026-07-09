import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@arts/ui';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { titleFromSlug } from '@/lib/slug';

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: titleFromSlug(params.slug) };
}

export default function ProductPage({ params }: Params) {
  const title = titleFromSlug(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: title },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery placeholder */}
        <div>
          <div className="aspect-[4/5] w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square border border-line bg-surface/50"
              />
            ))}
          </div>
        </div>

        {/* Product information */}
        <div className="lg:pt-6">
          <p className="eyebrow">Handcrafted in India</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-gold-300 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 font-serif text-xl italic text-muted">Price on request</p>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted">
            A placeholder product. Provenance, materials, dimensions, and the
            maker's story will appear here once the catalogue is connected.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-faint">Material</dt>
              <dd className="mt-1 text-fg">&mdash;</dd>
            </div>
            <div>
              <dt className="text-faint">Dimensions</dt>
              <dd className="mt-1 text-fg">&mdash;</dd>
            </div>
            <div>
              <dt className="text-faint">Region</dt>
              <dd className="mt-1 text-fg">&mdash;</dd>
            </div>
            <div>
              <dt className="text-faint">Maker</dt>
              <dd className="mt-1 text-fg">&mdash;</dd>
            </div>
          </dl>

          <div className="mt-10">
            <Button asChild variant="luxury" size="lg">
              <Link href={`/contact?ref=${params.slug}`}>Enquire about this piece</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
