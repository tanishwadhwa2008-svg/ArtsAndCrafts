import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'Our Story' };

export default function StoryPage() {
  return (
    <>
      <PageIntro
        eyebrow="Our heritage"
        title="A living archive of Indian craft"
        lede="For centuries, India's artisans have shaped clay, metal, fibre, and pigment into objects of everyday devotion."
      />

      <article className="mx-auto max-w-2xl px-6 pb-24">
        <div className="space-y-6 text-base leading-relaxed text-muted">
          <p>
            This page is a placeholder for the heritage story. It will become a
            long-form editorial experience &mdash; woven from rich text, imagery,
            and quotations authored in the content studio.
          </p>
          <p>
            Each collection traces a lineage: the region it comes from, the
            technique it preserves, and the families who have carried it across
            generations.
          </p>
        </div>

        <figure className="my-12">
          <div className="aspect-[3/2] w-full border border-line bg-gradient-to-b from-surface to-surface-2" />
          <figcaption className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-faint">
            Imagery to come
          </figcaption>
        </figure>

        <blockquote className="border-l-2 border-gold-600/50 pl-6 font-serif text-2xl italic leading-relaxed text-gold-200">
          &ldquo;Every handmade object carries the memory of the hand that made
          it.&rdquo;
        </blockquote>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-muted">
          <p>
            The final narrative &mdash; and the makers behind it &mdash; will be
            managed by the seller and published to this page.
          </p>
        </div>
      </article>
    </>
  );
}
