import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@arts/ui';
import { Breadcrumbs } from '@/components/site/breadcrumbs';
import { ProductGallery } from '@/components/shop/product-gallery';
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
        <ProductGallery images={product.images} title={product.title} />

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
