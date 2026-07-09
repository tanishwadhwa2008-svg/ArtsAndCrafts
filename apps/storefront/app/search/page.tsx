import type { Metadata } from 'next';
import { Search as SearchIcon } from 'lucide-react';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'Search' };

type SearchParams = { searchParams: { [key: string]: string | string[] | undefined } };

export default function SearchPage({ searchParams }: SearchParams) {
  const raw = searchParams.q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? '';

  return (
    <>
      <PageIntro eyebrow="Find a piece" title="Search" />

      <div className="mx-auto max-w-2xl px-6 pb-24">
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
            placeholder="Search collections, makers, materials…"
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

        <div className="mt-12 text-center">
          {query ? (
            <p className="text-sm text-muted">
              No results for <span className="text-fg">&ldquo;{query}&rdquo;</span>{' '}
              yet &mdash; the catalogue is being curated.
            </p>
          ) : (
            <p className="text-sm text-faint">Enter a term to search the collection.</p>
          )}
        </div>
      </div>
    </>
  );
}
