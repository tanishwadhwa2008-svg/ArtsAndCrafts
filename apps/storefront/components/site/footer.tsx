import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { footerSections } from './nav';

// Placeholder social destinations — replaced by StorefrontSettings (CMS) in E23.
const socials = [
  { label: 'Instagram', href: '#', Icon: Instagram },
  { label: 'Facebook', href: '#', Icon: Facebook },
  { label: 'Twitter', href: '#', Icon: Twitter },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.18em] text-gold-300">
              Arts and Crafts of India
            </p>
            <p className="mt-4 max-w-xs font-serif text-base italic leading-relaxed text-muted">
              Preserving India&rsquo;s living craft traditions &mdash; one
              handmade piece at a time.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="eyebrow text-xs">{section.title}</p>
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide text-faint">
            &copy; {year} Arts and Crafts of India. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
              >
                <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
