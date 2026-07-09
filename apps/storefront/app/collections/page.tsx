import type { Metadata } from 'next';
import { getCollections } from '@/lib/storefront';
import { PageIntro } from '@/components/site/page-intro';
import { CollectionCard } from '@/components/shop/collection-card';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Collections' };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <PageIntro
        eyebrow="Curated by craft"
        title="Collections"
        lede="Explore India's craft traditions, grouped by technique, region, and the hands that keep them alive."
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {!collections || collections.length === 0 ? (
          <p className="py-16 text-center text-muted">
            Collections are being curated. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
