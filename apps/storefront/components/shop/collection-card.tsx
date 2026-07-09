import Image from 'next/image';
import Link from 'next/link';
import type { CollectionCard as CollectionCardData } from '@/lib/storefront';

export function CollectionCard({ collection }: { collection: CollectionCardData }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block focus-visible:outline-none">
      <div className="relative aspect-[3/2] w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2">
        {collection.coverUrl ? (
          <Image
            src={collection.coverUrl}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="mt-4">
        <p className="eyebrow text-[0.68rem]">
          {collection.productCount} piece{collection.productCount === 1 ? '' : 's'}
        </p>
        <h3 className="mt-1 font-display text-lg text-fg transition-colors group-hover:text-gold-300">
          {collection.title}
        </h3>
      </div>
    </Link>
  );
}
