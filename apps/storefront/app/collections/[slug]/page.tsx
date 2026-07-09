import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ProductCard } from '@/components/shop/product-card';
import { getCollection } from '@/lib/storefront';
import { titleFromSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: titleFromSlug(params.slug) };
}

export default async function CollectionDetailPage({ params }: Params) {
  const collection = await getCollection(params.slug);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: collection.title },
        ]}
      />

      <header className="mt-10 max-w-2xl">
        <p className="eyebrow">Collection</p>
        <h1 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">{collection.title}</h1>
        {collection.description ? (
          <p className="mt-4 font-serif text-lg italic leading-relaxed text-muted">
            {collection.description}
          </p>
        ) : null}
      </header>

      {collection.products.length === 0 ? (
        <p className="mt-14 py-16 text-center text-muted">No pieces in this collection yet.</p>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
