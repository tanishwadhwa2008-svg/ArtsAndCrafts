import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { PlaceholderTile } from '@/components/site/placeholder-tile';
import { titleFromSlug } from '@/lib/slug';

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: titleFromSlug(params.slug) };
}

const products = [
  'hand-thrown-vase',
  'glazed-serving-bowl',
  'painted-tile-set',
  'ceramic-tea-service',
  'decorative-urn',
  'floral-platter',
];

export default function CollectionDetailPage({ params }: Params) {
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

      <header className="mt-10 max-w-2xl">
        <p className="eyebrow">Collection</p>
        <h1 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">{title}</h1>
        <p className="mt-4 font-serif text-lg italic leading-relaxed text-muted">
          A placeholder collection. Curated pieces and their provenance will
          appear here once the catalogue is connected.
        </p>
      </header>

      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
        {products.map((product) => (
          <PlaceholderTile
            key={product}
            href={`/products/${product}`}
            eyebrow="Handcrafted"
            title={titleFromSlug(product)}
          />
        ))}
      </div>
    </div>
  );
}
