import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="We would love to hear from you"
        title="Enquiries"
        lede="Questions about a piece, a commission, or a collaboration? Reach out and our team will respond personally."
      />

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="grid gap-10 border-t border-line pt-12 sm:grid-cols-2">
          <div>
            <p className="eyebrow text-xs">Reach us</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <span className="block text-faint">Email</span>
                <span className="text-fg">enquiries@artsandcraftsofindia.example</span>
              </li>
              <li>
                <span className="block text-faint">Studio</span>
                <span className="text-fg">New Delhi, India</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-xs">Enquiry form</p>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              A dedicated enquiry form is on its way. In the meantime, please
              reach us by email and reference the piece you are interested in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
