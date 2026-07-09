import Link from 'next/link';
import { Search } from 'lucide-react';
import { primaryNav } from './nav';
import { MobileMenu } from './mobile-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link
            href="/"
            className="whitespace-nowrap font-display text-[0.7rem] uppercase tracking-[0.16em] text-gold-300 transition-colors hover:text-gold-100 sm:text-sm sm:tracking-[0.2em]"
          >
            Arts and Crafts of India
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-9 lg:flex"
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center lg:ml-0">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
          >
            <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
