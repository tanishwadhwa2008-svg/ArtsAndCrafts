import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'Terms of Service' };

const sections = [
  {
    heading: 'Use of this site',
    body: 'This is placeholder text and not binding terms. The final terms will set out the conditions for using this website.',
  },
  {
    heading: 'Enquiries and orders',
    body: 'As the storefront is enquiry-based for now, terms covering commissions and purchases will be added before launch.',
  },
  {
    heading: 'Intellectual property',
    body: 'Rights covering imagery, product descriptions, and maker stories will be described here in the final copy.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Terms of Service" />
      <article className="mx-auto max-w-2xl px-6 pb-24">
        <p className="text-xs uppercase tracking-[0.16em] text-faint">
          Placeholder &mdash; final copy before launch
        </p>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg text-fg">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
