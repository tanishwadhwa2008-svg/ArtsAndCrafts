import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { PlaceholderTile } from '@/components/site/placeholder-tile';
import { titleFromSlug } from '@/lib/slug';

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: titleFromSlug(params.slug) };
}

const works = ['hand-thrown-vase', 'glazed-serving-bowl', 'painted-tile-set', 'decorative-urn'];

export default function MakerPage({ params }: Params) {
  const name = titleFromSlug(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Makers', href: '/makers' },
          { label: name },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div>
          <div className="aspect-[3/4] w-full border border-line bg-gradient-to-b from-surface to-surface-2" />
        </div>

        <div className="lg:pt-4">
          <p className="eyebrow">Master artisan</p>
          <h1 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">{name}</h1>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted">
            <p>
              A placeholder maker profile. The artisan's biography, region,
              technique, and portrait will appear here once profiles are
              published from the content studio.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-2xl text-gold-300">Works by {name}</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {works.map((work) => (
            <PlaceholderTile
              key={work}
              href={`/products/${work}`}
              eyebrow="Handcrafted"
              title={titleFromSlug(work)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
