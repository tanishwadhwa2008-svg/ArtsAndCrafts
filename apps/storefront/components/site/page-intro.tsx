import type { ReactNode } from 'react';

export function PageIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-4 font-display text-3xl leading-tight text-gold-300 sm:text-5xl">
        {title}
      </h1>
      {lede ? (
        <p className="mx-auto mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-muted">
          {lede}
        </p>
      ) : null}
    </header>
  );
}
