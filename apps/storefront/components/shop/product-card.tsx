import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as ProductCardData } from '@/lib/storefront';
import { formatPrice } from '@/lib/format';

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block focus-visible:outline-none">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-gradient-to-b from-surface-2 to-bg">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-base text-fg transition-colors group-hover:text-gold-300">
          {product.title}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-serif text-sm text-muted">
            {formatPrice(product.price, product.currency)}
          </p>
          <span
            className={`text-[0.62rem] uppercase tracking-[0.14em] ${
              product.inStock ? 'text-success' : 'text-faint'
            }`}
          >
            {product.inStock ? 'In stock' : 'Made to order'}
          </span>
        </div>
      </div>
    </Link>
  );
}
