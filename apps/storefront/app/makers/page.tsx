import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';
import { PlaceholderTile } from '@/components/site/placeholder-tile';

export const metadata: Metadata = { title: 'Makers' };

const makers = [
  { slug: 'ramesh-kumar', name: 'Ramesh Kumar', craft: 'Blue Pottery' },
  { slug: 'lakshmi-devi', name: 'Lakshmi Devi', craft: 'Madhubani Painting' },
  { slug: 'abdul-rashid', name: 'Abdul Rashid', craft: 'Pashmina Weaving' },
  { slug: 'sita-mahato', name: 'Sita Mahato', craft: 'Dhokra Metalcraft' },
];

export default function MakersPage() {
  return (
    <>
      <PageIntro
        eyebrow="The hands behind the craft"
        title="Makers"
        lede="Meet the artisans and family workshops whose skill and patience shape every piece."
      />
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {makers.map((maker) => (
            <PlaceholderTile
              key={maker.slug}
              href={`/makers/${maker.slug}`}
              eyebrow={maker.craft}
              title={maker.name}
              ratio="aspect-[3/4]"
            />
          ))}
        </div>
      </div>
    </>
  );
}
