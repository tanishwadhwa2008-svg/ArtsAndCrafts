import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@arts/ui';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { getProduct } from '@/lib/storefront';
import { formatPrice } from '@/lib/format';
import { titleFromSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

type Params = { params: { slug: string } };

export function generateMetadata({ params }: Params): Metadata {
  return { title: titleFromSlug(params.slug) };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const [primary, ...rest] = product.images;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: product.title },
        ]}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2">
            {primary ? (
              <Image
                src={primary.url}
                alt={primary.altText ?? product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : null}
          </div>
          {rest.length > 0 ? (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {rest.slice(0, 4).map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden border border-line bg-surface-2"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.title}
                    fill
                    sizes="12vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Product information */}
        <div className="lg:pt-6">
          <p className="eyebrow">
            {product.category ? product.category.name : 'Handcrafted in India'}
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-gold-300 sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-serif text-2xl text-fg">
              {formatPrice(product.price, product.currency)}
            </p>
            <span
              className={`text-xs uppercase tracking-[0.16em] ${
                product.inStock ? 'text-success' : 'text-faint'
              }`}
            >
              {product.inStock ? 'In stock' : 'Made to order'}
            </span>
          </div>

          {product.description ? (
            <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}

          {product.variants.length > 0 ? (
            <div className="mt-8 border-t border-line pt-6">
              <p className="eyebrow text-xs">Options</p>
              <ul className="mt-3 space-y-2 text-sm">
                {product.variants.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-4">
                    <span className="text-fg">{v.name}</span>
                    <span className="text-muted">
                      {formatPrice(v.price ?? product.price, product.currency)}
                      {v.inStock ? '' : ' · made to order'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10">
            <Button asChild variant="luxury" size="lg">
              <Link href={`/contact?ref=${product.slug}`}>Enquire about this piece</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
