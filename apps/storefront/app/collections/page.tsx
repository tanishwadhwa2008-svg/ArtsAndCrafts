import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';
import { PlaceholderTile } from '@/components/site/placeholder-tile';

export const metadata: Metadata = { title: 'Collections' };

const collections = [
  { slug: 'blue-pottery-of-jaipur', title: 'Blue Pottery of Jaipur', region: 'Rajasthan' },
  { slug: 'pattachitra-scrolls', title: 'Pattachitra Scrolls', region: 'Odisha' },
  { slug: 'pashmina-weaves', title: 'Pashmina Weaves', region: 'Kashmir' },
  { slug: 'bidriware', title: 'Bidriware', region: 'Karnataka' },
  { slug: 'dhokra-metalcraft', title: 'Dhokra Metalcraft', region: 'Chhattisgarh' },
  { slug: 'madhubani-painting', title: 'Madhubani Painting', region: 'Bihar' },
];

export default function CollectionsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Curated by craft"
        title="Collections"
        lede="Explore India's craft traditions, grouped by technique, region, and the hands that keep them alive."
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {collections.map((collection) => (
            <PlaceholderTile
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              eyebrow={collection.region}
              title={collection.title}
            />
          ))}
        </div>
      </div>
    </>
  );
}
