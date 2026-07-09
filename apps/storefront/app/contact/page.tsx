import type { Metadata } from 'next';
import { PageIntro } from '@/components/site/page-intro';
import { getContact } from '@/lib/storefront';

export const metadata: Metadata = { title: 'Contact' };

// Always reflect the seller's current contact settings.
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const contact = await getContact();
  const details = [
    contact?.phone
      ? { label: 'Phone', value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, '')}` }
      : null,
    contact?.email
      ? { label: 'Email', value: contact.email, href: `mailto:${contact.email}` }
      : null,
    contact?.location ? { label: 'Location', value: contact.location, href: null } : null,
  ].filter((d): d is { label: string; value: string; href: string | null } => d !== null);

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
            {details.length > 0 ? (
              <ul className="mt-5 space-y-4 text-sm">
                {details.map((d) => (
                  <li key={d.label}>
                    <span className="block text-faint">{d.label}</span>
                    {d.href ? (
                      <a href={d.href} className="text-fg transition-colors hover:text-gold-300">
                        {d.value}
                      </a>
                    ) : (
                      <span className="text-fg">{d.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-relaxed text-muted">
                Contact details will be added soon.
              </p>
            )}
          </div>

          <div>
            <p className="eyebrow text-xs">Enquiry form</p>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              A dedicated enquiry form is on its way. In the meantime, please
              reach us using the details here and reference the piece you are
              interested in.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
