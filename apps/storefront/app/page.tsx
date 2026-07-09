import Link from 'next/link';
import { BadgeCheck, Globe, Handshake } from 'lucide-react';
import { Button } from '@arts/ui';
import { getHomeFeed } from '@/lib/storefront';
import { ProductCard } from '@/components/shop/product-card';
import { CollectionCard } from '@/components/shop/collection-card';
import { OrnateFrame, Paisley } from '@/components/site/ornaments';

// Always render against the current catalogue (in sync with inventory/images).
export const dynamic = 'force-dynamic';

const heritageValues = [
  {
    title: 'Ancient techniques',
    body: 'Skills refined over centuries and passed from one generation of master artisans to the next.',
  },
  {
    title: 'One of a kind',
    body: 'Every piece is made entirely by hand, so no two are ever exactly alike.',
  },
  {
    title: 'Master artisans',
    body: "Created by the family workshops and craftspeople who keep India's living traditions alive.",
  },
  {
    title: 'Living traditions',
    body: 'Each piece you bring home helps a centuries-old craft — and the makers behind it — continue to thrive.',
  },
];

const artisanPromises = [
  {
    title: 'Direct from the artisan',
    body: 'Sourced straight from the makers and their workshops — never mass-produced.',
    Icon: Handshake,
  },
  {
    title: 'Authentic & handmade',
    body: 'Genuine, hand-crafted pieces, each carrying the natural marks of its maker.',
    Icon: BadgeCheck,
  },
  {
    title: 'Shipped worldwide',
    body: 'Carefully packed and delivered from India to your door, wherever you are.',
    Icon: Globe,
  },
];

export default async function HomePage() {
  const feed = await getHomeFeed();
  const collections = feed?.collections ?? [];
  const products = feed?.products ?? [];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {/* Silk grain + warm gold sheen behind the frame. */}
        <div
          aria-hidden="true"
          className="texture-silk pointer-events-none absolute inset-0 -z-20 opacity-[0.06]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(72%_60%_at_50%_-10%,rgba(201,159,74,0.14),transparent_70%)]"
        />
        {/* Paisley watermark, top-right. */}
        <Paisley className="pointer-events-none absolute -right-12 -top-10 -z-10 h-80 w-80 text-gold-500/[0.06] sm:h-[26rem] sm:w-[26rem]" />

        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <OrnateFrame className="flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-20">
            <p className="eyebrow mb-5">Handcrafted in India</p>

            <h1 className="bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-display text-4xl leading-[1.12] text-transparent sm:text-5xl">
              Indian heritage,
              <br />
              curated for the world.
            </h1>

            <p className="mt-7 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
              A living archive of India&rsquo;s master craftsmanship — every piece
              shaped by hand, carrying the story of its maker, its materials, and
              the centuries-old tradition it belongs to.
            </p>

            <div className="mt-11">
              <Button
                asChild
                variant="luxury"
                size="lg"
                className="max-w-full px-5 text-xs sm:px-6 sm:text-base"
              >
                <Link href="/collections">Explore the collection</Link>
              </Button>
            </div>
          </OrnateFrame>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="eyebrow">Why our craft endures</p>
          <h2 className="mt-2 font-display text-3xl text-gold-300 sm:text-4xl">
            Rooted in ancient tradition
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {heritageValues.map((value, index) => (
            <div key={value.title} className="border-t border-line pt-5">
              <p className="font-display text-sm tracking-[0.2em] text-gold-500">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-display text-lg text-fg">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      {collections.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Curated by craft</p>
              <h2 className="mt-2 font-display text-3xl text-gold-300">Collections</h2>
            </div>
            <Link
              href="/collections"
              className="shrink-0 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold-300"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="eyebrow">The latest</p>
            <h2 className="mt-2 font-display text-3xl text-gold-300">New arrivals</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="eyebrow">Our heritage</p>
        <h2 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">
          Made to outlast the moment
        </h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-muted">
          <p>
            For centuries, India&rsquo;s artisans have shaped everyday materials
            — clay and brass, wool and wood, pigment and thread — into objects of
            quiet, lasting beauty. We work directly with the master craftspeople
            who still practise these techniques, exactly as they were handed down
            through generations.
          </p>
          <p>
            Nothing here is mass-produced or made to be replaced. Each piece is
            built by hand to be lived with for a lifetime and passed on — carrying
            its craft, and its story, into the years ahead.
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-2xl font-serif text-2xl italic leading-relaxed text-gold-200 sm:text-3xl">
          &ldquo;Every handmade object carries the memory of the hand that made
          it.&rdquo;
        </p>
        <div className="mt-8">
          <Button asChild variant="luxury">
            <Link href="/about">Our story</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-line bg-surface/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-3 sm:px-8">
          {artisanPromises.map(({ title, body, Icon }) => (
            <div key={title} className="text-center">
              <Icon
                className="mx-auto h-7 w-7 text-gold-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h3 className="mt-4 font-display text-lg text-fg">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <Paisley className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-80 w-80 -scale-x-100 text-gold-500/[0.05]" />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="eyebrow">Begin your collection</p>
          <h2 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">
            Bring a piece of India home
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-muted">
            Explore handcrafted treasures made by India&rsquo;s finest artisans —
            or discover the story behind the craft.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Button asChild variant="luxury" className="px-6">
              <Link href="/collections">Explore the collection</Link>
            </Button>
            <Link
              href="/about"
              className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold-300"
            >
              Read our story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
