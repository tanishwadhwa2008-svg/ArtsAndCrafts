import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="Our heritage"
        title="Arts and Crafts of India"
        lede="A curated home for India's handmade traditions — carrying the craft of the workshop to people who value the made-by-hand."
      />

      <article className="mx-auto max-w-2xl px-6 pb-24">
        <div className="space-y-6 text-base leading-relaxed text-muted">
          <p>
            Arts and Crafts of India brings together handcrafted objects made by
            artisans and family workshops across the country — pottery and
            metalwork, weaving and painting, each shaped by a tradition passed
            down through generations.
          </p>
          <p>
            Every piece is made by hand, so no two are exactly alike. Small
            variations in form, colour, and finish are the signature of a maker
            rather than a machine &mdash; the quiet marks of time and skill.
          </p>
        </div>

        <blockquote className="my-12 border-l-2 border-gold-600/50 pl-6 font-serif text-2xl italic leading-relaxed text-gold-200">
          &ldquo;We believe the objects we live with should carry a story worth
          keeping.&rdquo;
        </blockquote>

        <div className="space-y-6 text-base leading-relaxed text-muted">
          <p>
            We work directly with the people who make these pieces, so that the
            craft &mdash; and the livelihoods behind it &mdash; can continue to
            thrive. When you bring one home, you become part of that story.
          </p>
          <p>
            Have a question about a piece, or looking for something bespoke?
            We&rsquo;d love to hear from you.
          </p>
        </div>
      </article>
    </>
  );
}
