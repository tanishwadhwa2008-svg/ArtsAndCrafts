import Link from 'next/link';
import { Button } from '@arts/ui';
import { getHomeFeed } from '@/lib/storefront';
import { ProductCard } from '@/components/shop/product-card';
import { CollectionCard } from '@/components/shop/collection-card';
import { OrnateFrame, Paisley } from '@/components/site/ornaments';

// Always render against the current catalogue (in sync with inventory/images).
export const dynamic = 'force-dynamic';

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
            <p className="eyebrow mb-5">Arts and Crafts of India</p>

            <h1 className="bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 bg-clip-text font-display text-4xl leading-[1.12] text-transparent sm:text-5xl">
              Handcrafted heritage,
              <br />
              curated for the world.
            </h1>

            <p className="mt-7 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
              A living archive of master craftsmanship — every piece carrying the
              story of its maker, its materials, and the tradition it belongs to.
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
        <p className="mt-5 font-serif text-2xl italic leading-relaxed text-gold-200 sm:text-3xl">
          &ldquo;Every handmade object carries the memory of the hand that made
          it.&rdquo;
        </p>
        <div className="mt-8">
          <Button asChild variant="luxury">
            <Link href="/about">Our story</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
