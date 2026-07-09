import Link from 'next/link';

/**
 * Image-forward placeholder tile used across listing skeletons (collections,
 * makers, related works). Deliberately minimal — a hairline-framed image area
 * with the label sitting on the page background (no boxed card). Real imagery
 * and data arrive in E24.
 */
export function PlaceholderTile({
  href,
  eyebrow,
  title,
  ratio = 'aspect-[4/5]',
}: {
  href: string;
  eyebrow?: string;
  title: string;
  ratio?: string;
}) {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <div
        className={`${ratio} w-full overflow-hidden border border-line bg-gradient-to-b from-surface to-surface-2 transition-colors group-hover:border-gold-500/40 group-focus-visible:border-gold-500/60`}
      />
      <div className="mt-4">
        {eyebrow ? <p className="eyebrow text-[0.68rem]">{eyebrow}</p> : null}
        <h3 className="mt-1 font-display text-base text-fg transition-colors group-hover:text-gold-300">
          {title}
        </h3>
      </div>
    </Link>
  );
}
