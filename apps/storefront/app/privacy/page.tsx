import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'Privacy Policy' };

const sections = [
  {
    heading: 'Overview',
    body: 'This is placeholder text and not a binding policy. The final privacy policy will describe what information we collect and how it is used.',
  },
  {
    heading: 'Information we collect',
    body: 'Details of the data collected through enquiries and browsing will be documented here before launch.',
  },
  {
    heading: 'Contact',
    body: 'Questions about privacy will be directed to a dedicated contact address provided in the final copy.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Privacy Policy" />
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
