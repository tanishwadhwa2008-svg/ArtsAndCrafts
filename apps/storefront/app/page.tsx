import Link from 'next/link';
import { BloomLoader, Button } from '@arts/ui';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow mb-5">Artisan Collective</p>

      <h1 className="font-display text-4xl leading-[1.1] text-gold-300 sm:text-6xl">
        Handcrafted heritage,
        <br />
        curated for the world.
      </h1>

      <p className="mt-7 max-w-xl font-serif text-lg italic leading-relaxed text-muted sm:text-xl">
        A living archive of master craftsmanship — every piece carrying the
        story of its maker, its materials, and the tradition it belongs to.
      </p>

      <div className="mt-11">
        <Button asChild variant="luxury" size="lg">
          <Link href="/collections">Explore the collection</Link>
        </Button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-3">
        <BloomLoader className="h-10 w-10 text-gold-500" label="Loading the atelier" />
        <span className="text-xs uppercase tracking-[0.2em] text-faint">
          Storefront · scaffold
        </span>
      </div>
    </main>
  );
}
