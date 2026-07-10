import Link from 'next/link';
import { BadgeCheck, Globe, Handshake } from 'lucide-react';
import { Button } from '@arts/ui';
import { getHomeFeed } from '@/lib/storefront';
import { CollectionCarousel } from '@/components/shop/collection-carousel';
import { OrnateFrame } from '@/components/site/ornaments';

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
    body: 'Each piece you bring home helps a centuries-old craft and the makers behind it continue to thrive.',
  },
];

const artisanPromises = [
  {
    title: 'Direct from the artisan',
    body: 'Sourced straight from the makers and their workshops, never mass-produced.',
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

  return (
    <>
      {/* Fixed golden-ratio backdrop: it stays pinned to the viewport while the
          opaque sections below scroll up and over it, so the rotating mandala
          reads as a stationary layer the page slides across. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Silk grain + warm gold sheen. */}
        <div className="texture-silk absolute inset-0 opacity-[0.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(72%_60%_at_50%_-10%,rgba(227,185,72,0.16),transparent_70%)]" />
        {/* Rotating golden-ratio sacred-geometry mandala (oversized + centred so
            the spin never exposes empty corners; clipped to the viewport). */}
        <div className="absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full opacity-[0.08] animate-[slowRotate_90s_linear_infinite]"
            style={{
              backgroundImage: "url('/patterns/sacred-geometry.svg')",
              backgroundSize: '480px',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>

      {/* Hero — transparent so the fixed backdrop shows through behind the text. */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <OrnateFrame className="flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-20">
            <p className="eyebrow mb-5">Handcrafted in India</p>

            <h1 className="bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-display text-4xl leading-[1.12] text-transparent sm:text-5xl">
              Indian heritage,
              <br />
              curated for the world.
            </h1>

            <p className="mt-7 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
              A living archive of India&rsquo;s master craftsmanship. Every piece
              is shaped by hand, carrying the story of its maker, its materials,
              and the centuries-old tradition it belongs to.
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

      {/* Opaque wine layer: every section below scrolls up over the fixed
          backdrop, covering the mandala for a true overlap. */}
      <div className="relative z-10 bg-bg">
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
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="eyebrow">Curated by craft</p>
            <h2 className="mt-2 font-display text-3xl text-gold-300 sm:text-4xl">
              Featured collections
            </h2>
          </div>
          <CollectionCarousel collections={collections} />
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
            into objects of quiet, lasting beauty, transforming clay and brass,
            wool and wood, pigment and thread with their hands. We work directly
            with the master craftspeople who still practise these techniques,
            exactly as they were handed down through generations.
          </p>
          <p>
            Nothing here is mass-produced or made to be replaced. Each piece is
            built by hand to be lived with for a lifetime and passed on, carrying
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
      </div>

      {/* Closing CTA — transparent so the fixed mandala shows through again. */}
      <section className="relative">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="eyebrow">Begin your collection</p>
          <h2 className="mt-3 font-display text-3xl text-gold-300 sm:text-4xl">
            Bring a piece of India home
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-muted">
            Explore handcrafted treasures made by India&rsquo;s finest artisans,
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
