import Link from 'next/link';
import { Button } from '@arts/ui';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-display text-4xl text-gold-300 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-5 font-serif text-lg italic leading-relaxed text-muted">
        The page you are looking for may have been moved, or never existed.
      </p>
      <div className="mt-10">
        <Button asChild variant="luxury" size="lg">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
