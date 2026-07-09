import type { Metadata } from 'next';
import { Search as SearchIcon } from 'lucide-react';
import { PageIntro } from '@/components/site/page-intro';
import { getProducts } from '@/lib/storefront';
import { ProductCard } from '@/components/shop/product-card';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Search' };

type SearchParams = { searchParams: { [key: string]: string | string[] | undefined } };

export default async function SearchPage({ searchParams }: SearchParams) {
  const raw = searchParams.q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';
  const results = query ? await getProducts({ search: query, limit: 24 }) : null;

  return (
    <>
      <PageIntro eyebrow="Find a piece" title="Search" />

      <div className="mx-auto max-w-2xl px-6">
        <form
          action="/search"
          method="get"
          role="search"
          className="flex items-center gap-3 border-b border-line pb-3 transition-colors focus-within:border-gold-500/60"
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-faint" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products by name…"
            aria-label="Search the collection"
            className="w-full bg-transparent py-2 text-base text-fg placeholder:text-faint focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 text-xs uppercase tracking-[0.18em] text-gold-300 transition-colors hover:text-gold-100"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {!query ? (
          <p className="text-center text-sm text-faint">Enter a term to search the collection.</p>
        ) : !results || results.length === 0 ? (
          <p className="text-center text-sm text-muted">
            No results for <span className="text-fg">&ldquo;{query}&rdquo;</span>.
          </p>
        ) : (
          <>
            <p className="mb-8 text-center text-sm text-muted">
              {results.length} result{results.length === 1 ? '' : 's'} for{' '}
              <span className="text-fg">&ldquo;{query}&rdquo;</span>
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
